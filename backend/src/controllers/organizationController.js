import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import {
  DEFAULT_LEAVE_POLICY,
  validateLeavePolicy,
} from '../lib/defaultLeavePolicy.js';
import {
  DEFAULT_ADMIN_SETTINGS,
  DEFAULT_ORG_SETTINGS,
  sanitizeAdminSettings,
} from '../lib/adminSettings.js';
import {
  getRoleLabel,
  notifyAdmins,
  notifyEmployeeProfileEvent,
  notifyOrgWide,
} from '../services/notificationService.js';
import { sendEmail } from '../services/emailService.js';

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

const employeeDirectorySelectBase = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  role: true,
  designation: true,
  gender: true,
  createdAt: true,
  birthDate: true,
  joiningDate: true,
  team: {
    select: {
      id: true,
      name: true,
      department: {
        select: { id: true, name: true },
      },
    },
  },
};

function isMissingReportingManagerColumn(error) {
  if (!error) return false;
  const m = String(error.message ?? '');
  if (m.includes('reportingManagerId') || m.includes('reportingManager')) {
    return true;
  }
  const col = error.meta?.column;
  if (col != null && String(col).includes('reportingManager')) return true;
  return false;
}

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

    const leavesPromise = prisma.leave.findMany({
      where: {
        organizationId,
        status: 'APPROVED',
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      select: { userId: true },
    });

    let users;
    try {
      users = await prisma.user.findMany({
        where: employeeWhere,
        orderBy: { name: 'asc' },
        select: {
          ...employeeDirectorySelectBase,
          reportingManager: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (err) {
      if (!isMissingReportingManagerColumn(err)) throw err;
      console.warn(
        '[employees] reportingManager column missing; run: npx prisma migrate deploy. Listing employees without reporting manager.',
      );
      users = await prisma.user.findMany({
        where: employeeWhere,
        orderBy: { name: 'asc' },
        select: { ...employeeDirectorySelectBase },
      });
    }

    const leavesToday = await leavesPromise;

    const onLeaveUserIds = new Set(leavesToday.map((l) => l.userId));

    const employees = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation ?? null,
      isActive: u.isActive ?? true,
      gender: u.gender ?? null,
      createdAt: u.createdAt.toISOString(),
      birthDate: u.birthDate ? u.birthDate.toISOString() : null,
      joiningDate: u.joiningDate ? u.joiningDate.toISOString() : null,
      reportingManager:
        u.reportingManager != null
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
      // Deactivated users should not surface as "On leave" in directory status.
      onLeaveToday: (u.isActive ?? true) && onLeaveUserIds.has(u.id),
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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Department created',
        body: `${dept.name} department was created.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] department created', notifyErr);
    }

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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Department updated',
        body: `${updated.name} department was updated.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] department updated', notifyErr);
    }

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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Department deleted',
        body: `${dept.name} department was deleted.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] department deleted', notifyErr);
    }
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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Team created',
        body: `${team.name} team was created in ${team.department.name}.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] team created', notifyErr);
    }

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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Team updated',
        body: `${team.name} team settings were updated.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] team updated', notifyErr);
    }

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
    try {
      await notifyAdmins({
        organizationId,
        type: 'ORG_STRUCTURE_UPDATED',
        title: 'Team deleted',
        body: `${team.name} team was deleted.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] team deleted', notifyErr);
    }
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
      designation,
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
    const designationValue = String(designation ?? '').trim();
    if (!designationValue) {
      return res.status(400).json({ message: 'Designation is required' });
    }
    if (designationValue.length > 100) {
      return res.status(400).json({ message: 'Designation is too long' });
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
        designation: designationValue,
        // Employee creation always starts as active; only admins can deactivate later.
        isActive: true,
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
        designation: true,
        isActive: true,
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

    try {
      await notifyEmployeeProfileEvent({
        organizationId,
        userId: user.id,
        type: 'EMPLOYEE_ADDED',
        title: 'Welcome onboard',
        body: `Your ${getRoleLabel(user.role)} profile has been created.`,
      });
      await notifyAdmins({
        organizationId,
        type: 'EMPLOYEE_ADDED',
        title: 'Employee added',
        body: `${user.name} (${user.email}) joined as ${getRoleLabel(user.role)}.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] employee created', notifyErr);
    }

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
      status,
      gender,
      teamId,
      birthDate,
      joiningDate,
      role,
      reportingManagerId,
      designation,
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
    if (designation !== undefined) {
      const designationValue = String(designation).trim();
      if (!designationValue) {
        return res.status(400).json({ message: 'Designation cannot be empty' });
      }
      if (designationValue.length > 100) {
        return res.status(400).json({ message: 'Designation is too long' });
      }
      data.designation = designationValue;
    }
    if (status !== undefined) {
      if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
        return res
          .status(400)
          .json({ message: 'Status must be Active or Deactivated' });
      }
      data.isActive = status === 'ACTIVE';
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
        designation: true,
        isActive: true,
        teamId: true,
        gender: true,
        birthDate: true,
        joiningDate: true,
        reportingManager: { select: { id: true, name: true } },
      },
    });

    try {
      await notifyEmployeeProfileEvent({
        organizationId,
        userId: user.id,
        type: 'EMPLOYEE_UPDATED',
        title: 'Profile updated',
        body: 'Your profile details were updated by admin.',
      });
      if (existing.isActive !== user.isActive) {
        await notifyEmployeeProfileEvent({
          organizationId,
          userId: user.id,
          type: user.isActive ? 'EMPLOYEE_REACTIVATED' : 'EMPLOYEE_DEACTIVATED',
          title: user.isActive ? 'Account reactivated' : 'Account deactivated',
          body: user.isActive
            ? 'Your account has been reactivated.'
            : 'Your account has been deactivated by admin.',
        });
      }
      await notifyAdmins({
        organizationId,
        type: 'EMPLOYEE_UPDATED',
        title: 'Employee updated',
        body: `${user.name} profile was updated.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] employee updated', notifyErr);
    }

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

    const employeeName = existing.name ?? 'Employee';
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

    try {
      await notifyAdmins({
        organizationId,
        type: 'EMPLOYEE_UPDATED',
        title: 'Employee removed',
        body: `${employeeName} was removed from organization.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] employee deleted', notifyErr);
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

const parseDateInput = (raw) => {
  if (!raw || !String(raw).trim()) return null;
  const parsed = new Date(`${String(raw).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const endOfMonthDate = (year, month1to12) => {
  if (!Number.isFinite(year) || !Number.isFinite(month1to12)) return null;
  if (month1to12 < 1 || month1to12 > 12) return null;
  return new Date(year, month1to12, 0, 12, 0, 0, 0);
};

const resolveSalaryEffectiveDate = (raw) => {
  if (!raw || !String(raw).trim()) {
    const now = new Date();
    return endOfMonthDate(now.getFullYear(), now.getMonth() + 1);
  }
  const v = String(raw).trim();
  // Supports YYYY-MM (month picker) by resolving to month-end payout date.
  if (/^\d{4}-\d{2}$/.test(v)) {
    const [y, m] = v.split('-').map(Number);
    return endOfMonthDate(y, m);
  }
  // Supports YYYY-MM-DD and then normalizes to that month's end date.
  const parsed = parseDateInput(v);
  if (!parsed) return null;
  return endOfMonthDate(parsed.getFullYear(), parsed.getMonth() + 1);
};

const toNumberOrZero = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return num;
};

const toFiniteOrNull = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const monthlyTaxFromYearlyGross = (yearlyGrossSalary) => {
  if (!Number.isFinite(yearlyGrossSalary) || yearlyGrossSalary <= 0) return 0;
  if (yearlyGrossSalary <= 1200000) return 0;
  return (yearlyGrossSalary * 0.15) / 12;
};

const deriveSalaryFromYearlyGross = (yearlyGrossSalary) => {
  const monthlyGross = yearlyGrossSalary / 12;
  const basicSalary = monthlyGross * 0.5;
  const hra = basicSalary * 0.4;
  const allowance = Math.max(monthlyGross - basicSalary - hra, 0);
  const bonus = 0;
  const pf = basicSalary * 0.12;
  const tax = monthlyTaxFromYearlyGross(yearlyGrossSalary);
  const professionalTax = 200;
  return {
    yearlyGrossSalary,
    basicSalary,
    hra,
    allowance,
    bonus,
    pf,
    tax,
    professionalTax,
  };
};

const computeNetSalary = (salary) =>
  toNumberOrZero(salary.basicSalary) +
  toNumberOrZero(salary.hra) +
  toNumberOrZero(salary.allowance) +
  toNumberOrZero(salary.bonus) -
  toNumberOrZero(salary.pf) -
  toNumberOrZero(salary.tax) -
  toNumberOrZero(salary.professionalTax) -
  toNumberOrZero(salary.lopAmount);

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const dayCountInclusive = (from, to) => {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (end < start) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
};

const overlapDaysInclusive = (aStart, aEnd, bStart, bEnd) => {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  return dayCountInclusive(start, end);
};

export const getEmployeeDetails = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid employee' });
    }

    const employee = await prisma.user.findFirst({
      where: { id: userId, organizationId, role: { not: 'ADMIN' } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        isActive: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const now = new Date();
    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const [leaveSummary, salaryStructures, payrolls, monthlyLeaves] = await Promise.all([
      prisma.leave.groupBy({
        by: ['status'],
        where: { userId, organizationId },
        _count: { status: true },
      }),
      prisma.salaryStructure.findMany({
        where: { userId, organizationId },
        orderBy: [{ isActive: 'desc' }, { effectiveFrom: 'desc' }],
      }),
      prisma.payroll.findMany({
        where: { userId, organizationId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        take: 12,
      }),
      prisma.leave.findMany({
        where: {
          userId,
          organizationId,
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        select: { status: true, startDate: true, endDate: true },
      }),
    ]);

    const leave = { pending: 0, approved: 0, rejected: 0 };
    leaveSummary.forEach((row) => {
      if (row.status === 'PENDING') leave.pending = row._count.status;
      if (row.status === 'APPROVED') leave.approved = row._count.status;
      if (row.status === 'REJECTED') leave.rejected = row._count.status;
    });

    let appliedLeaveDays = 0;
    let approvedLeaveDays = 0;
    let pendingLeaveDays = 0;
    let rejectedLeaveDays = 0;

    for (const row of monthlyLeaves) {
      const days = overlapDaysInclusive(
        row.startDate,
        row.endDate,
        monthStart,
        monthEnd,
      );
      appliedLeaveDays += days;
      if (row.status === 'APPROVED') approvedLeaveDays += days;
      if (row.status === 'PENDING') pendingLeaveDays += days;
      if (row.status === 'REJECTED') rejectedLeaveDays += days;
    }

    const todayClampedToMonth = now < monthEnd ? now : monthEnd;
    const elapsedMonthDays = dayCountInclusive(monthStart, todayClampedToMonth);
    const workedDays = Math.max(0, elapsedMonthDays - approvedLeaveDays);

    res.json({
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        designation: employee.designation ?? null,
        status: employee.isActive ? 'ACTIVE' : 'DEACTIVATED',
        department: employee.team?.department?.name ?? null,
        team: employee.team?.name ?? null,
        createdAt: employee.createdAt.toISOString(),
      },
      leave,
      leaveDaySummary: {
        workedDays,
        appliedLeaveDays,
        approvedLeaveDays,
        pendingLeaveDays,
        rejectedLeaveDays,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      salaryStructures: salaryStructures.map((row) => ({
        ...row,
        effectiveFrom: row.effectiveFrom.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      payrolls: payrolls.map((row) => ({
        ...row,
        paidDate: row.paidDate ? row.paidDate.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
      })),
      documents: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load employee details' });
  }
};

export const upsertEmployeeSalaryStructure = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can update salary structure' });
    }
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid employee' });
    }

    const employee = await prisma.user.findFirst({
      where: { id: userId, organizationId, role: { not: 'ADMIN' } },
      select: { id: true },
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const yearlyGrossSalary = toFiniteOrNull(req.body.yearlyGrossSalary);
    const derived =
      yearlyGrossSalary != null && yearlyGrossSalary > 0
        ? deriveSalaryFromYearlyGross(yearlyGrossSalary)
        : null;

    const basicSalaryInput = toFiniteOrNull(req.body.basicSalary);
    const basicSalary = basicSalaryInput ?? derived?.basicSalary ?? null;
    if (!Number.isFinite(basicSalary) || Number(basicSalary) < 0) {
      return res.status(400).json({ message: 'Basic salary must be valid' });
    }

    const payload = {
      yearlyGrossSalary,
      basicSalary: Number(basicSalary),
      hra: toFiniteOrNull(req.body.hra) ?? derived?.hra ?? 0,
      allowance: toFiniteOrNull(req.body.allowance) ?? derived?.allowance ?? 0,
      bonus: toFiniteOrNull(req.body.bonus) ?? derived?.bonus ?? 0,
      pf: toFiniteOrNull(req.body.pf) ?? derived?.pf ?? 0,
      tax: toFiniteOrNull(req.body.tax) ?? derived?.tax ?? 0,
      professionalTax:
        toFiniteOrNull(req.body.professionalTax) ?? derived?.professionalTax ?? 0,
      lopDays: Math.max(toNumberOrZero(req.body.lopDays), 0),
      lopAmount: Math.max(toNumberOrZero(req.body.lopAmount), 0),
      effectiveFrom: resolveSalaryEffectiveDate(req.body.effectiveFrom),
    };
    if (!payload.effectiveFrom) {
      return res.status(400).json({ message: 'Invalid salary month/effective date' });
    }

    await prisma.salaryStructure.updateMany({
      where: { userId, organizationId, isActive: true },
      data: { isActive: false },
    });

    const created = await prisma.salaryStructure.create({
      data: {
        userId,
        organizationId,
        ...payload,
        isActive: true,
      },
    });

    const netSalary = computeNetSalary(payload);
    const payrollDate = payload.effectiveFrom;
    const payrollMonth = payrollDate.getMonth() + 1;
    const payrollYear = payrollDate.getFullYear();
    await prisma.payroll.upsert({
      where: {
        userId_month_year: {
          userId,
          month: payrollMonth,
          year: payrollYear,
        },
      },
      update: {
        yearlyGrossSalary: payload.yearlyGrossSalary,
        basicSalary: payload.basicSalary,
        hra: payload.hra,
        allowance: payload.allowance,
        bonus: payload.bonus,
        pf: payload.pf,
        tax: payload.tax,
        professionalTax: payload.professionalTax,
        lopDays: payload.lopDays,
        lopAmount: payload.lopAmount,
        netSalary,
      },
      create: {
        userId,
        organizationId,
        month: payrollMonth,
        year: payrollYear,
        yearlyGrossSalary: payload.yearlyGrossSalary,
        basicSalary: payload.basicSalary,
        hra: payload.hra,
        allowance: payload.allowance,
        bonus: payload.bonus,
        pf: payload.pf,
        tax: payload.tax,
        professionalTax: payload.professionalTax,
        lopDays: payload.lopDays,
        lopAmount: payload.lopAmount,
        netSalary,
        status: 'PENDING',
      },
    });

    try {
      await notifyEmployeeProfileEvent({
        organizationId,
        userId,
        type: 'SALARY_STRUCTURE_UPDATED',
        title: 'Salary structure updated',
        body: `Your salary structure was updated effective ${payload.effectiveFrom.toLocaleDateString('en-IN')}.`,
      });
      await notifyAdmins({
        organizationId,
        type: 'SALARY_STRUCTURE_UPDATED',
        title: 'Salary structure updated',
        body: `Salary structure updated for employee #${userId}.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] salary structure updated', notifyErr);
    }

    res.status(201).json({
      salaryStructure: {
        ...created,
        effectiveFrom: created.effectiveFrom.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      computedNetSalary: netSalary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update salary structure' });
  }
};

const serializeAdminSettingsResponse = (org) => {
  const normalizedSettings = sanitizeAdminSettings(org.adminSettings);
  return {
    generalSettings: {
      companyName: org.name ?? '',
      companyEmail: org.email ?? '',
      phoneNumber: org.phoneNumber ?? '',
      officeAddress: org.officeAddress ?? '',
      timezone: org.timezone ?? DEFAULT_ORG_SETTINGS.timezone,
      currency: org.currency ?? DEFAULT_ORG_SETTINGS.currency,
      dateFormat: org.dateFormat ?? DEFAULT_ORG_SETTINGS.dateFormat,
    },
    leavePolicySettings: normalizedSettings.leavePolicySettings,
    payrollSettings: normalizedSettings.payrollSettings,
    rolePermissions: normalizedSettings.rolePermissions,
    themePreferences: normalizedSettings.themePreferences,
  };
};

export const getAdminSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        officeAddress: true,
        timezone: true,
        currency: true,
        dateFormat: true,
        adminSettings: true,
      },
    });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.json(serializeAdminSettingsResponse(org));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load admin settings' });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const general = payload.generalSettings ?? {};
    const companyName = String(general.companyName ?? '').trim();
    const companyEmail = String(general.companyEmail ?? '').trim().toLowerCase();
    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    if (!companyEmail) {
      return res.status(400).json({ message: 'Company email is required' });
    }
    const adminSettings = sanitizeAdminSettings({
      leavePolicySettings: payload.leavePolicySettings,
      payrollSettings: payload.payrollSettings,
      rolePermissions: payload.rolePermissions,
      themePreferences: payload.themePreferences,
    });

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: companyName,
        email: companyEmail,
        phoneNumber: String(general.phoneNumber ?? '').trim(),
        officeAddress: String(general.officeAddress ?? '').trim(),
        timezone:
          String(general.timezone ?? '').trim() || DEFAULT_ORG_SETTINGS.timezone,
        currency:
          String(general.currency ?? '').trim() || DEFAULT_ORG_SETTINGS.currency,
        dateFormat:
          String(general.dateFormat ?? '').trim() || DEFAULT_ORG_SETTINGS.dateFormat,
        adminSettings,
      },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        officeAddress: true,
        timezone: true,
        currency: true,
        dateFormat: true,
        adminSettings: true,
      },
    });

    try {
      await notifyAdmins({
        organizationId,
        type: 'ADMIN_SETTINGS_UPDATED',
        title: 'Admin settings updated',
        body: `${req.user?.name ?? 'Admin'} updated organization settings.`,
      });
    } catch (notifyErr) {
      console.error('[notifications] admin settings updated', notifyErr);
    }
    return res.json(serializeAdminSettingsResponse(updated));
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return res
        .status(400)
        .json({ message: 'Organization name or email already exists' });
    }
    return res.status(500).json({ message: 'Failed to save admin settings' });
  }
};

export const resetAdminSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        timezone: DEFAULT_ORG_SETTINGS.timezone,
        currency: DEFAULT_ORG_SETTINGS.currency,
        dateFormat: DEFAULT_ORG_SETTINGS.dateFormat,
        adminSettings: DEFAULT_ADMIN_SETTINGS,
      },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        officeAddress: true,
        timezone: true,
        currency: true,
        dateFormat: true,
        adminSettings: true,
      },
    });

    try {
      await notifyAdmins({
        organizationId,
        type: 'ADMIN_SETTINGS_UPDATED',
        title: 'Admin settings reset',
        body: 'Organization admin settings were reset to defaults.',
      });
    } catch (notifyErr) {
      console.error('[notifications] admin settings reset', notifyErr);
    }
    return res.json(serializeAdminSettingsResponse(updated));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to reset admin settings' });
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

    try {
      await notifyOrgWide({
        organizationId,
        type: 'LEAVE_POLICY_UPDATED',
        title: 'Leave policy updated',
        body: 'Leave policy has been updated. Please review latest rules.',
      });
    } catch (notifyErr) {
      console.error('[notifications] leave policy updated', notifyErr);
    }

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

    try {
      await notifyOrgWide({
        organizationId,
        type: 'LEAVE_POLICY_UPDATED',
        title: 'Leave policy reset',
        body: 'Leave policy has been reset to default.',
      });
    } catch (notifyErr) {
      console.error('[notifications] leave policy reset', notifyErr);
    }

    res.json({ policy: DEFAULT_LEAVE_POLICY, usingDefault: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reset leave policy' });
  }
};


export const testSmtpConfiguration = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can test SMTP settings' });
    }

    const { targetEmail } = req.body;
    if (!targetEmail) {
      return res.status(400).json({ message: 'Target email is required for the test' });
    }

    const organizationId = req.user.organizationId;
    const adminName = req.user.name || 'Administrator';

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">SMTP Test Successful!</h2>
        <p>Hello <strong>${adminName}</strong>,</p>
        <p>This is a test email from your <strong>Timeout HRM</strong> instance. If you are reading this, your SMTP settings are correctly configured and ready for production.</p>
        <p style="margin-top: 20px; color: #64748b; font-size: 0.875rem;">
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    await sendEmail({
      to: targetEmail,
      subject: 'SMTP Test - Timeout HRM',
      html,
    });

    return res.json({ message: `Test email sent successfully to ${targetEmail}. Please check your inbox (and spam folder).` });
  } catch (error) {
    console.error('[testSmtpConfiguration]', error);
    return res.status(500).json({ 
      message: `SMTP Test failed: ${error.message}`,
      code: 'SMTP_ERROR'
    });
  }
};
