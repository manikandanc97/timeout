import prisma from '../src/prismaClient.js';

async function seedHolidayCalendar() {
  try {
    await prisma.holiday.deleteMany({});

    await prisma.holiday.createMany({
      data: [
        { name: 'Pongal', date: new Date('2026-01-15') },
        { name: 'Thiruvalluvar Day', date: new Date('2026-01-16') },
        { name: 'Republic Day', date: new Date('2026-01-26') },
        { name: 'Good Friday', date: new Date('2026-04-03') },
        { name: 'Labour Day', date: new Date('2026-05-01') },
        { name: 'Independence Day', date: new Date('2026-08-15') },
        { name: 'Krishna Jayanthi', date: new Date('2026-09-04') },
        { name: 'Gandhi Jayanti', date: new Date('2026-10-02') },
        { name: 'Diwali', date: new Date('2026-11-08') },
        { name: 'Christmas', date: new Date('2026-12-25') },
      ],
    });

    console.log('Holiday calendar seeded successfully');
  } finally {
    await prisma.$disconnect();
  }
}

seedHolidayCalendar().catch((error) => {
  console.error('Failed to seed holiday calendar:', error);
  process.exitCode = 1;
});
