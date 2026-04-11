import prisma from '../prismaClient.js';

const LEAVE_TYPE_LABEL = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
};

function labelLeaveType(type) {
  return LEAVE_TYPE_LABEL[type] ?? type;
}

function startOfWeekMonday(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeekSunday(d = new Date()) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Next calendar occurrence of month/day on/after `from` (local), or null */
function nextBirthdayOccurrence(birthDate, from) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const month = b.getMonth();
  const day = b.getDate();
  const y = from.getFullYear();
  let candidate = new Date(y, month, day, 12, 0, 0, 0);
  if (candidate < from) {
    candidate = new Date(y + 1, month, day, 12, 0, 0, 0);
  }
  return candidate;
}

async function countDepartmentsRaw(organizationId) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS c
      FROM "Department"
      WHERE "organizationId" = ${organizationId}
    `;
    return Number(rows[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

/** Rows: { id, name, birthDate } — uses raw SQL so it works even if Prisma client was not regenerated after adding birthDate. */
async function fetchUsersWithBirthDateRaw(organizationId) {
  try {
    return await prisma.$queryRaw`
      SELECT id, name, "birthDate" AS "birthDate"
      FROM "User"
      WHERE "organizationId" = ${organizationId}
        AND role != 'ADMIN'
        AND "birthDate" IS NOT NULL
    `;
  } catch {
    return [];
  }
}

/** Rows: { teamId, c } */
async function fetchTeamMemberCountsRaw(organizationId) {
  try {
    return await prisma.$queryRaw`
      SELECT "teamId", COUNT(*)::int AS c
      FROM "User"
      WHERE "organizationId" = ${organizationId}
        AND role != 'ADMIN'
        AND "teamId" IS NOT NULL
      GROUP BY "teamId"
    `;
  } catch {
    return [];
  }
}

export const getAdminDashboardData = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const employeeWhere = {
      organizationId,
      role: { not: 'ADMIN' },
    };

    const totalEmployees = await prisma.user.count({
      where: employeeWhere,
    });

    const pendingRequests = await prisma.leave.count({
      where: { organizationId, status: 'PENDING' },
    });

    const departmentCount = await countDepartmentsRaw(organizationId);

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const leavesToday = await prisma.leave.findMany({
      where: {
        organizationId,
        status: 'APPROVED',
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    const onLeaveToday = leavesToday.length;

    const employeesOnLeaveToday = leavesToday.map((row) => ({
      userName: row.user?.name ?? 'Unknown',
      leaveType: labelLeaveType(row.type),
    }));

    const presentToday = Math.max(0, totalEmployees - onLeaveToday);

    const usersWithDob = await fetchUsersWithBirthDateRaw(organizationId);

    const fromDay = new Date(startOfDay);
    const horizon = new Date(fromDay);
    horizon.setDate(horizon.getDate() + 60);

    const upcomingBirthdays = usersWithDob
      .map((u) => {
        const next = nextBirthdayOccurrence(u.birthDate, fromDay);
        if (!next || next > horizon) return null;
        return {
          name: u.name,
          date: next.toISOString(),
          dateLabel: next.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);

    const weekStart = startOfWeekMonday(today);
    const weekEnd = endOfWeekSunday(today);

    const newJoiners = await prisma.user.findMany({
      where: {
        ...employeeWhere,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        team: { select: { name: true } },
      },
      take: 20,
    });

    const newJoinersThisWeek = newJoiners.map((u) => ({
      name: u.name,
      teamName: u.team?.name ?? 'Unassigned',
    }));

    const teamCountsRaw = await fetchTeamMemberCountsRaw(organizationId);
    const teamIds = teamCountsRaw.map((t) => t.teamId).filter((id) => id != null);

    let teams = [];
    if (teamIds.length > 0) {
      teams = await prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true },
      });
    }
    const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

    const teamEmployeeCounts = teamCountsRaw
      .filter((row) => row.teamId != null)
      .map((row) => ({
        teamName: teamNameById.get(row.teamId) ?? 'Team',
        count: Number(row.c ?? 0),
      }))
      .sort((a, b) => b.count - a.count);

    const unassignedCount = await prisma.user.count({
      where: { ...employeeWhere, teamId: null },
    });
    if (unassignedCount > 0) {
      teamEmployeeCounts.push({
        teamName: 'Unassigned',
        count: unassignedCount,
      });
    }

    res.status(200).json({
      totalEmployees,
      presentToday,
      onLeaveToday,
      pendingRequests,
      departments: departmentCount,
      employeesOnLeaveToday,
      upcomingBirthdays,
      newJoinersThisWeek,
      teamEmployeeCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
