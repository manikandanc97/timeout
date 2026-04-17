import bcrypt from 'bcrypt';
import prisma from '../src/prismaClient.js';

async function seed() {
  const organization = await prisma.organization.upsert({
    where: { email: 'demo@acmehrm.com' },
    update: {
      name: 'Acme HRM Demo',
      phoneNumber: '+1-555-0100',
      officeAddress: 'Bangalore, India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
    create: {
      name: 'Acme HRM Demo',
      email: 'demo@acmehrm.com',
      phoneNumber: '+1-555-0100',
      officeAddress: 'Bangalore, India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });

  const engineering = await prisma.department.upsert({
    where: {
      organizationId_name: { organizationId: organization.id, name: 'Engineering' },
    },
    update: { sortOrder: 1 },
    create: {
      organizationId: organization.id,
      name: 'Engineering',
      sortOrder: 1,
    },
  });

  const operations = await prisma.department.upsert({
    where: {
      organizationId_name: { organizationId: organization.id, name: 'Operations' },
    },
    update: { sortOrder: 2 },
    create: {
      organizationId: organization.id,
      name: 'Operations',
      sortOrder: 2,
    },
  });

  const platformTeam = await prisma.team.upsert({
    where: { name_departmentId: { name: 'Platform', departmentId: engineering.id } },
    update: { organizationId: organization.id },
    create: {
      name: 'Platform',
      organizationId: organization.id,
      departmentId: engineering.id,
    },
  });

  const hrTeam = await prisma.team.upsert({
    where: { name_departmentId: { name: 'HR Ops', departmentId: operations.id } },
    update: { organizationId: organization.id },
    create: {
      name: 'HR Ops',
      organizationId: organization.id,
      departmentId: operations.id,
    },
  });

  const defaultPasswordHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@acmehrm.com' },
    update: {
      name: 'Aarav Admin',
      password: defaultPasswordHash,
      role: 'ADMIN',
      organizationId: organization.id,
      teamId: hrTeam.id,
    },
    create: {
      name: 'Aarav Admin',
      email: 'admin@acmehrm.com',
      password: defaultPasswordHash,
      role: 'ADMIN',
      gender: 'MALE',
      organizationId: organization.id,
      teamId: hrTeam.id,
      designation: 'HR Director',
      joiningDate: new Date('2023-01-10'),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@acmehrm.com' },
    update: {
      name: 'Maya Manager',
      password: defaultPasswordHash,
      role: 'MANAGER',
      organizationId: organization.id,
      teamId: platformTeam.id,
      reportingManagerId: admin.id,
    },
    create: {
      name: 'Maya Manager',
      email: 'manager@acmehrm.com',
      password: defaultPasswordHash,
      role: 'MANAGER',
      gender: 'FEMALE',
      organizationId: organization.id,
      teamId: platformTeam.id,
      reportingManagerId: admin.id,
      designation: 'Engineering Manager',
      joiningDate: new Date('2023-05-15'),
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@acmehrm.com' },
    update: {
      name: 'Eshan Employee',
      password: defaultPasswordHash,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      teamId: platformTeam.id,
      reportingManagerId: manager.id,
    },
    create: {
      name: 'Eshan Employee',
      email: 'employee@acmehrm.com',
      password: defaultPasswordHash,
      role: 'EMPLOYEE',
      gender: 'MALE',
      organizationId: organization.id,
      teamId: platformTeam.id,
      reportingManagerId: manager.id,
      designation: 'Software Engineer',
      joiningDate: new Date('2024-02-01'),
      birthDate: new Date('1999-09-18'),
    },
  });

  await prisma.leaveBalance.upsert({
    where: { userId: employee.id },
    update: { annual: 10, sick: 8, compOff: 1 },
    create: {
      userId: employee.id,
      annual: 10,
      sick: 8,
      compOff: 1,
    },
  });

  await prisma.salaryStructure.deleteMany({
    where: { userId: employee.id, organizationId: organization.id },
  });
  await prisma.salaryStructure.create({
    data: {
      userId: employee.id,
      organizationId: organization.id,
      yearlyGrossSalary: 1200000,
      basicSalary: 55000,
      hra: 22000,
      allowance: 6000,
      bonus: 4000,
      pf: 1800,
      tax: 3500,
      professionalTax: 200,
      effectiveFrom: new Date('2026-01-01'),
      isActive: true,
    },
  });

  await prisma.leave.deleteMany({
    where: { userId: employee.id, organizationId: organization.id },
  });
  await prisma.leave.createMany({
    data: [
      {
        userId: employee.id,
        organizationId: organization.id,
        teamId: platformTeam.id,
        type: 'ANNUAL',
        startDate: new Date('2026-04-07'),
        endDate: new Date('2026-04-09'),
        reason: 'Family event',
        status: 'APPROVED',
        balanceDeductedDays: 3,
      },
      {
        userId: employee.id,
        organizationId: organization.id,
        teamId: platformTeam.id,
        type: 'SICK',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-04-15'),
        reason: 'Viral fever',
        status: 'PENDING',
        balanceDeductedDays: 1,
      },
    ],
  });

  await prisma.payroll.upsert({
    where: { userId_month_year: { userId: employee.id, month: 3, year: 2026 } },
    update: {
      yearlyGrossSalary: 1200000,
      basicSalary: 55000,
      hra: 22000,
      allowance: 6000,
      bonus: 4000,
      pf: 1800,
      tax: 3500,
      professionalTax: 200,
      lopDays: 0,
      lopAmount: 0,
      netSalary: 81400,
      status: 'PAID',
      paidDate: new Date('2026-04-01'),
    },
    create: {
      userId: employee.id,
      organizationId: organization.id,
      month: 3,
      year: 2026,
      yearlyGrossSalary: 1200000,
      basicSalary: 55000,
      hra: 22000,
      allowance: 6000,
      bonus: 4000,
      pf: 1800,
      tax: 3500,
      professionalTax: 200,
      lopDays: 0,
      lopAmount: 0,
      netSalary: 81400,
      status: 'PAID',
      paidDate: new Date('2026-04-01'),
    },
  });

  console.log('Demo seed complete');
  console.log('Admin login: admin@acmehrm.com / demo1234');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
