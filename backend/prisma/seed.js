import bcrypt from 'bcrypt';
import prisma from '../src/prismaClient.js';

async function seed() {
  console.log('🌱 Starting Enterprise Seed...');

  // 1. Create Organization
  const organization = await prisma.organization.upsert({
    where: { email: 'demo@acmehrm.com' },
    update: {
      name: 'Acme Global Solutions',
      phoneNumber: '+1-555-0100',
      officeAddress: '123 Enterprise Way, Bangalore, KA',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
    create: {
      name: 'Acme Global Solutions',
      email: 'demo@acmehrm.com',
      phoneNumber: '+1-555-0100',
      officeAddress: '123 Enterprise Way, Bangalore, KA',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });

  // 2. Create Departments
  const engineering = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: 'Engineering' } },
    update: {},
    create: { organizationId: organization.id, name: 'Engineering', sortOrder: 1 },
  });

  const hrDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: 'Human Resources' } },
    update: {},
    create: { organizationId: organization.id, name: 'Human Resources', sortOrder: 2 },
  });

  // 3. Create Teams
  const platformTeam = await prisma.team.upsert({
    where: { name_departmentId: { name: 'Platform Engineering', departmentId: engineering.id } },
    update: {},
    create: { name: 'Platform Engineering', organizationId: organization.id, departmentId: engineering.id },
  });

  const hrOpsTeam = await prisma.team.upsert({
    where: { name_departmentId: { name: 'HR Operations', departmentId: hrDept.id } },
    update: {},
    create: { name: 'HR Operations', organizationId: organization.id, departmentId: hrDept.id },
  });

  const defaultPasswordHash = await bcrypt.hash('demo1234', 10);

  // 4. Create Admin (The Standard Credential)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acmehrm.com' },
    update: { password: defaultPasswordHash, role: 'ADMIN' },
    create: {
      name: 'Aditi Admin',
      email: 'admin@acmehrm.com',
      password: defaultPasswordHash,
      role: 'ADMIN',
      gender: 'FEMALE',
      organizationId: organization.id,
      teamId: hrOpsTeam.id,
      designation: 'HR Director',
      joiningDate: new Date('2023-01-10'),
    },
  });

  // 5. Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@acmehrm.com' },
    update: { password: defaultPasswordHash, role: 'MANAGER' },
    create: {
      name: 'Manoj Manager',
      email: 'manager@acmehrm.com',
      password: defaultPasswordHash,
      role: 'MANAGER',
      gender: 'MALE',
      organizationId: organization.id,
      teamId: platformTeam.id,
      reportingManagerId: admin.id,
      designation: 'Engineering Manager',
      joiningDate: new Date('2023-05-15'),
    },
  });

  // 6. Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@acmehrm.com' },
    update: { password: defaultPasswordHash, role: 'EMPLOYEE' },
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
    },
  });

  // 7. Seed Salary Structure & Payroll (Refactored)
  console.log('💰 Seeding Payroll & Salary Structure...');
  
  await prisma.salaryStructure.deleteMany({ where: { userId: employee.id } });
  const salary = await prisma.salaryStructure.create({
    data: {
      userId: employee.id,
      organizationId: organization.id,
      yearlyGrossSalary: 1200000,
      basicSalary: 50000,
      hra: 20000,
      conveyance: 5000,
      specialAllowance: 10000,
      allowance: 5000,
      bonus: 2000,
      pf: 6000,
      esi: 675,
      professionalTax: 200,
      tds: 5000,
      pfRate: 12.0,
      esiRate: 0.75,
      overtimeRate: 500,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
    },
  });

  const payroll = await prisma.payroll.upsert({
    where: { userId_month_year: { userId: employee.id, month: 3, year: 2026 } },
    update: { status: 'PAID' },
    create: {
      userId: employee.id,
      organizationId: organization.id,
      month: 3,
      year: 2026,
      yearlyGrossSalary: 1200000,
      basicSalary: 50000,
      hra: 20000,
      conveyance: 5000,
      specialAllowance: 10000,
      allowance: 5000,
      bonus: 2000,
      pf: 6000,
      esi: 675,
      professionalTax: 200,
      tds: 5000,
      netSalary: 80125,
      status: 'PAID',
      paidDate: new Date('2026-04-01'),
    },
  });

  // 8. Seed Audit Logs
  console.log('📜 Seeding Audit Logs...');
  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      actorId: admin.id,
      entityType: 'SALARY_STRUCTURE',
      entityId: salary.id,
      action: 'CREATE',
      newValue: salary,
    },
  });

  await prisma.payrollApprovalLog.create({
    data: {
      organizationId: organization.id,
      payrollId: payroll.id,
      actorId: admin.id,
      status: 'PAID',
      comment: 'Initial payroll disbursement',
    },
  });

  console.log('✅ Enterprise Seed Complete!');
  console.log('---------------------------');
  console.log('Admin Creds: admin@acmehrm.com / demo1234');
  console.log('Manager Creds: manager@acmehrm.com / demo1234');
  console.log('Employee Creds: employee@acmehrm.com / demo1234');
}

seed()
  .catch((e) => {
    console.error('❌ Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
