import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import {
  DEFAULT_LEAVE_POLICY,
  validateLeavePolicy,
} from '../lib/defaultLeavePolicy.js';

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

export const getOrganizationEmployees = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const employeeWhere = {
      organizationId,
      role: { not: 'ADMIN' },
    };

    const [users, leavesToday] = await Promise.all([
      prisma.user.findMany({
        where: employeeWhere,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          gender: true,
          createdAt: true,
          birthDate: true,
          joiningDate: true,
          reportingManager: {
            select: { id: true, name: true },
          },
          team: {
            select: {
              id: true,
              name: true,
              department: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      prisma.leave.findMany({
        where: {
          organizationId,
          status: 'APPROVED',
          startDate: { lte: endOfDay },
          endDate: { gte: startOfDay },
        },
        select: { userId: true },
      }),
    ]);

    const onLeaveUserIds = new Set(leavesToday.map((l) => l.userId));

    const employees = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      gender: u.gender ?? null,
      createdAt: u.createdAt.toISOString(),
      birthDate: u.birthDate ? u.birthDate.toISOString() : null,
      joiningDate: u.joiningDate ? u.joiningDate.toISOString() : null,
      reportingManager: u.reportingManager
        ? { id: u.reportingManager.id, name: u.reportingManager.name }
        : null,
      team: u.team
        ? {
            id: u.team.id,
            name: u.team.name,
            department: u.team.department
              ? {
                  id: u.team.department.id,
                  name: u.team.department.name,
                }
              : null,
          }
        : null,
      onLeaveToday: onLeaveUserIds.has(u.id),
    }));

    res.json({ employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load employees' });
  }
};

export const getReportingManagerOptions = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can load this list' });
    }
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const excludeRaw = req.query.exclude;
    const excludeId =
      excludeRaw != null && String(excludeRaw).trim() !== ''
        ? Number(excludeRaw)
        : NaN;

    const users = await prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['MANAGER', 'ADMIN'] },
        ...(Number.isFinite(excludeId) && !Number.isNaN(excludeId)
          ? { NOT: { id: excludeId } }
          : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    res.json({ options: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load reporting managers' });
  }
};

export const getOrganizationTeams = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const [teams, departmentCount] = await Promise.all([
      prisma.team.findMany({
        where: { organizationId },
        orderBy: [
          { department: { sortOrder: 'asc' } },
          { name: 'asc' },
        ],
        include: {
          department: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.department.count({ where: { organizationId } }),
    ]);

    const managerIds = [
      ...new Set(
        teams.map((t) => t.managerId).filter((id) => id != null),
      ),
    ];
    const managers =
      managerIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: managerIds }, organizationId },
            select: { id: true, name: true, email: true },
          })
        : [];
    const managerById = new Map(managers.map((m) => [m.id, m]));

    const rows = teams.map((t) => {
      const leadUser =
        t.managerId != null ? managerById.get(t.managerId) : null;
      const lead = leadUser
        ? {
            id: leadUser.id,
            name: leadUser.name,
            email: leadUser.email,
          }
        : null;
      const employeeCount = t._count.members;
      return {
        id: t.id,
        name: t.name,
        departmentId: t.departmentId,
        departmentName: t.department.name,
        createdAt: t.createdAt.toISOString(),
        employeeCount,
        lead,
        status: employeeCount > 0 ? 'ACTIVE' : 'EMPTY',
      };
    });

    res.json({ teams: rows, departmentCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load teams' });
  }
};

export const createOrganizationDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can create departments' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const { name } = req.body;
    const trimmed = name != null ? String(name).trim() : '';
    if (!trimmed) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const agg = await prisma.department.aggregate({
      where: { organizationId },
      _max: { sortOrder: true },
    });
    const nextSort = (agg._max.sortOrder ?? -1) + 1;

    const dept = await prisma.department.create({
      data: {
        name: trimmed,
        organizationId,
        sortOrder: nextSort,
      },
    });

    res.status(201).json({
      department: {
        id: dept.id,
        name: dept.name,
        sortOrder: dept.sortOrder,
        teams: [],
      },
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return res.status(400).json({
        message: 'A department with this name already exists',
      });
    }
    res.status(500).json({ message: 'Failed to create department' });
  }
};

export const updateOrganizationDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can update departments' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const idParam = Number(req.params.departmentId);
    if (Number.isNaN(idParam)) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const { name } = req.body;
    const trimmed = name != null ? String(name).trim() : '';
    if (!trimmed) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const existing = await prisma.department.findFirst({
      where: { id: idParam, organizationId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const updated = await prisma.department.update({
      where: { id: idParam },
      data: { name: trimmed },
    });

    res.json({
      department: {
        id: updated.id,
        name: updated.name,
        sortOrder: updated.sortOrder,
      },
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return res.status(400).json({
        message: 'A department with this name already exists',
      });
    }
    res.status(500).json({ message: 'Failed to update department' });
  }
};

export const deleteOrganizationDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can delete departments' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const idParam = Number(req.params.departmentId);
    if (Number.isNaN(idParam)) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const dept = await prisma.department.findFirst({
      where: { id: idParam, organizationId },
      include: { _count: { select: { teams: true } } },
    });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (dept._count.teams > 0) {
      return res.status(400).json({
        message:
          'This department still has teams. Move or delete those teams first.',
      });
    }

    await prisma.department.delete({ where: { id: idParam } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete department' });
  }
};

export const createOrganizationTeam = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can create teams' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const { name, departmentId } = req.body;
    if (!name || departmentId == null) {
      return res
        .status(400)
        .json({ message: 'Name and department are required' });
    }

    const deptIdNum = Number(departmentId);
    if (Number.isNaN(deptIdNum)) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const dept = await prisma.department.findFirst({
      where: { id: deptIdNum, organizationId },
    });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const trimmed = String(name).trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await prisma.team.create({
      data: {
        name: trimmed,
        organizationId,
        departmentId: deptIdNum,
      },
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    res.status(201).json({
      team: {
        id: team.id,
        name: team.name,
        departmentId: team.departmentId,
        departmentName: team.department.name,
        createdAt: team.createdAt.toISOString(),
        employeeCount: team._count.members,
        lead: null,
        status: 'EMPTY',
      },
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return res.status(400).json({
        message: 'A team with this name already exists in that department',
      });
    }
    res.status(500).json({ message: 'Failed to create team' });
  }
};

export const updateOrganizationTeam = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update teams' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const idParam = Number(req.params.teamId);
    if (Number.isNaN(idParam)) {
      return res.status(400).json({ message: 'Invalid team' });
    }

    const existing = await prisma.team.findFirst({
      where: { id: idParam, organizationId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const { name, departmentId } = req.body;
    const data = {};

    if (name != null) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Team name is required' });
      }
      data.name = trimmed;
    }

    if (departmentId != null) {
      const deptIdNum = Number(departmentId);
      if (Number.isNaN(deptIdNum)) {
        return res.status(400).json({ message: 'Invalid department' });
      }
      const dept = await prisma.department.findFirst({
        where: { id: deptIdNum, organizationId },
      });
      if (!dept) {
        return res.status(404).json({ message: 'Department not found' });
      }
      data.departmentId = deptIdNum;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const team = await prisma.team.update({
      where: { id: idParam },
      data,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    const managers =
      team.managerId != null
        ? await prisma.user.findMany({
            where: { id: team.managerId, organizationId },
            select: { id: true, name: true, email: true },
          })
        : [];
    const leadUser = managers[0] ?? null;
    const lead = leadUser
      ? {
          id: leadUser.id,
          name: leadUser.name,
          email: leadUser.email,
        }
      : null;
    const employeeCount = team._count.members;

    res.json({
      team: {
        id: team.id,
        name: team.name,
        departmentId: team.departmentId,
        departmentName: team.department.name,
        createdAt: team.createdAt.toISOString(),
        employeeCount,
        lead,
        status: employeeCount > 0 ? 'ACTIVE' : 'EMPTY',
      },
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return res.status(400).json({
        message: 'A team with this name already exists in that department',
      });
    }
    res.status(500).json({ message: 'Failed to update team' });
  }
};

export const deleteOrganizationTeam = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete teams' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const idParam = Number(req.params.teamId);
    if (Number.isNaN(idParam)) {
      return res.status(400).json({ message: 'Invalid team' });
    }

    const team = await prisma.team.findFirst({
      where: { id: idParam, organizationId },
      include: { _count: { select: { members: true } } },
    });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team._count.members > 0) {
      return res.status(400).json({
        message:
          'This team still has employees. Reassign or remove them before deleting the team.',
      });
    }

    await prisma.team.delete({ where: { id: idParam } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
};

export const createEmployeeUser = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can add employees' });
    }

    const {
      name,
      email,
      password,
      gender,
      teamId,
      birthDate,
      joiningDate,
      role,
      reportingManagerId,
    } = req.body;

    if (!name || !email || !password || teamId == null) {
      return res
        .status(400)
        .json({ message: 'Name, email, password, and team are required' });
    }

    if (gender !== 'MALE' && gender !== 'FEMALE') {
      return res.status(400).json({ message: 'Gender is required' });
    }

    let userRole = 'EMPLOYEE';
    if (role != null && String(role).trim() !== '') {
      if (role === 'MANAGER' || role === 'EMPLOYEE') {
        userRole = role;
      } else {
        return res
          .status(400)
          .json({ message: 'Role must be Employee or Manager' });
      }
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

    const parseCalendarDate = (raw) => {
      if (!raw || !String(raw).trim()) return null;
      const parsed = new Date(`${String(raw).slice(0, 10)}T12:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const birthDateValue = parseCalendarDate(birthDate);
    const joiningDateValue = parseCalendarDate(joiningDate);
    if (!joiningDateValue) {
      return res
        .status(400)
        .json({ message: 'Joining date (DOJ) is required' });
    }

    let reportingManagerIdValue = null;
    if (reportingManagerId != null && String(reportingManagerId).trim() !== '') {
      const rmId = Number(reportingManagerId);
      if (Number.isNaN(rmId)) {
        return res.status(400).json({ message: 'Invalid reporting manager' });
      }
      const rm = await prisma.user.findFirst({
        where: {
          id: rmId,
          organizationId,
          role: { in: ['MANAGER', 'ADMIN'] },
        },
      });
      if (!rm) {
        return res
          .status(404)
          .json({ message: 'Reporting manager not found' });
      }
      reportingManagerIdValue = rmId;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        organizationId,
        teamId: teamIdNum,
        gender,
        birthDate: birthDateValue,
        joiningDate: joiningDateValue,
        reportingManagerId: reportingManagerIdValue,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        gender: true,
        birthDate: true,
        joiningDate: true,
        reportingManager: { select: { id: true, name: true } },
      },
    });

    await prisma.leaveBalance.create({
      data: { userId: user.id },
    });

    res.status(201).json({
      message: 'Employee created',
      user: {
        ...user,
        birthDate: user.birthDate ? user.birthDate.toISOString() : null,
        joiningDate: user.joiningDate ? user.joiningDate.toISOString() : null,
        reportingManager: user.reportingManager,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateEmployeeUser = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update employees' });
    }

    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid employee' });
    }

    const existing = await prisma.user.findFirst({
      where: { id: userId, organizationId, role: { not: 'ADMIN' } },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      name,
      email,
      password,
      gender,
      teamId,
      birthDate,
      joiningDate,
      role,
      reportingManagerId,
    } = req.body;

    const data = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      data.name = trimmed;
    }
    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      if (!trimmed) {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }
      const other = await prisma.user.findFirst({
        where: { email: trimmed, NOT: { id: userId } },
      });
      if (other) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      data.email = trimmed;
    }
    if (password !== undefined && String(password).trim() !== '') {
      data.password = await bcrypt.hash(String(password), 10);
    }
    if (gender !== undefined) {
      if (gender !== 'MALE' && gender !== 'FEMALE') {
        return res.status(400).json({ message: 'Invalid gender' });
      }
      data.gender = gender;
    }
    if (role !== undefined) {
      if (role !== 'MANAGER' && role !== 'EMPLOYEE') {
        return res
          .status(400)
          .json({ message: 'Role must be Employee or Manager' });
      }
      data.role = role;
    }
    if (teamId !== undefined) {
      const teamIdNum = Number(teamId);
      if (Number.isNaN(teamIdNum)) {
        return res.status(400).json({ message: 'Invalid team' });
      }
      const team = await prisma.team.findFirst({
        where: { id: teamIdNum, organizationId },
      });
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      data.teamId = teamIdNum;
    }

    const parseCalendarDate = (raw) => {
      if (!raw || !String(raw).trim()) return null;
      const parsed = new Date(`${String(raw).slice(0, 10)}T12:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    if (birthDate !== undefined) {
      data.birthDate = parseCalendarDate(birthDate);
    }
    if (joiningDate !== undefined) {
      const jd = parseCalendarDate(joiningDate);
      if (!jd) {
        return res
          .status(400)
          .json({ message: 'Joining date (DOJ) is required' });
      }
      data.joiningDate = jd;
    }
    if (reportingManagerId !== undefined) {
      if (
        reportingManagerId == null ||
        String(reportingManagerId).trim() === ''
      ) {
        data.reportingManagerId = null;
      } else {
        const rmId = Number(reportingManagerId);
        if (Number.isNaN(rmId)) {
          return res.status(400).json({ message: 'Invalid reporting manager' });
        }
        if (rmId === userId) {
          return res.status(400).json({
            message: 'Cannot set yourself as reporting manager',
          });
        }
        const rm = await prisma.user.findFirst({
          where: {
            id: rmId,
            organizationId,
            role: { in: ['MANAGER', 'ADMIN'] },
          },
        });
        if (!rm) {
          return res
            .status(404)
            .json({ message: 'Reporting manager not found' });
        }
        data.reportingManagerId = rmId;
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No changes provided' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        gender: true,
        birthDate: true,
        joiningDate: true,
        reportingManager: { select: { id: true, name: true } },
      },
    });

    res.json({
      message: 'Employee updated',
      user: {
        ...user,
        birthDate: user.birthDate ? user.birthDate.toISOString() : null,
        joiningDate: user.joiningDate ? user.joiningDate.toISOString() : null,
        reportingManager: user.reportingManager,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

export const deleteEmployeeUser = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete employees' });
    }

    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid employee' });
    }

    if (req.user.id === userId) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    const existing = await prisma.user.findFirst({
      where: { id: userId, organizationId, role: { not: 'ADMIN' } },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { reportingManagerId: userId },
        data: { reportingManagerId: null },
      }),
      prisma.leave.updateMany({
        where: { approvedById: userId },
        data: { approvedById: null },
      }),
      prisma.leave.deleteMany({ where: { userId } }),
      prisma.leaveBalance.deleteMany({ where: { userId } }),
      prisma.team.updateMany({
        where: { managerId: userId },
        data: { managerId: null },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

const resolveStoredLeavePolicy = (stored) => {
  if (stored == null) {
    return { policy: DEFAULT_LEAVE_POLICY, usingDefault: true };
  }
  const checked = validateLeavePolicy(stored);
  if (checked.ok) {
    return { policy: checked.value, usingDefault: false };
  }
  return { policy: DEFAULT_LEAVE_POLICY, usingDefault: true };
};

export const getLeavePolicy = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { leavePolicy: true },
    });

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const { policy, usingDefault } = resolveStoredLeavePolicy(org.leavePolicy);
    res.json({ policy, usingDefault });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load leave policy' });
  }
};

export const updateLeavePolicy = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update leave policy' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const checked = validateLeavePolicy(req.body);
    if (!checked.ok) {
      return res.status(400).json({ message: checked.message });
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { leavePolicy: checked.value },
    });

    res.json({ policy: checked.value, usingDefault: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save leave policy' });
  }
};

export const resetLeavePolicy = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can reset leave policy' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { leavePolicy: null },
    });

    res.json({ policy: DEFAULT_LEAVE_POLICY, usingDefault: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reset leave policy' });
  }
};
