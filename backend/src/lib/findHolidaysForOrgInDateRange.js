import prisma from '../prismaClient.js';

export async function findHolidaysForOrgInDateRange(organizationId, from, to) {
  return prisma.holiday.findMany({
    where: { organizationId, date: { gte: from, lte: to } },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      date: true,
      name: true,
      organizationId: true,
    },
  });
}
