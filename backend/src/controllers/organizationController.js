import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';

export const getOrganizationStructure = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    /** Raw SQL so this route works even if `prisma generate` was not run after adding Department. */
    const deptRows = await prisma.$queryRaw`
      SELECT id, name, "sortOrder"
      FROM "Department"
      WHERE "organizationId" = ${organizationId}
      ORDER BY "sortOrder" ASC, name ASC
    `;

    const teamRows = await prisma.$queryRaw`
      SELECT id, name, "departmentId"
      FROM "Team"
      WHERE "organizationId" = ${organizationId}
      ORDER BY name ASC
    `;

    const departments = deptRows.map((d) => ({
      id: Number(d.id),
      name: d.name,
      sortOrder: Number(d.sortOrder ?? 0),
      teams: teamRows
        .filter((t) => Number(t.departmentId) === Number(d.id))
        .map((t) => ({
          id: Number(t.id),
          name: t.name,
        })),
    }));

    res.json({ departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load organization structure' });
  }
};

export const createEmployeeUser = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can add employees' });
    }

    const { name, email, password, gender, teamId, birthDate } = req.body;

    if (!name || !email || !password || teamId == null) {
      return res
        .status(400)
        .json({ message: 'Name, email, password, and team are required' });
    }

    const teamIdNum = Number(teamId);
    if (Number.isNaN(teamIdNum)) {
      return res.status(400).json({ message: 'Invalid team' });
    }

    const team = await prisma.team.findFirst({
      where: { id: teamIdNum, organizationId },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found for this organization' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let birthDateValue = null;
    if (birthDate && String(birthDate).trim()) {
      const parsed = new Date(`${String(birthDate).slice(0, 10)}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) birthDateValue = parsed;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        organizationId,
        teamId: teamIdNum,
        gender:
          gender === 'MALE' || gender === 'FEMALE' ? gender : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        gender: true,
      },
    });

    if (birthDateValue) {
      try {
        await prisma.$executeRaw`
          UPDATE "User"
          SET "birthDate" = ${birthDateValue}
          WHERE id = ${user.id}
        `;
      } catch (e) {
        console.warn('Could not set birthDate (column missing or DB error)', e);
      }
    }

    await prisma.leaveBalance.create({
      data: { userId: user.id },
    });

    res.status(201).json({
      message: 'Employee created',
      user: {
        ...user,
        birthDate: birthDateValue ? birthDateValue.toISOString() : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
