/**
 * Default departments and teams created for each new organization at signup.
 * Order follows sortOrder; team names are unique within a department.
 */
export const DEFAULT_ORG_STRUCTURE = [
  {
    name: 'Engineering',
    sortOrder: 10,
    teams: ['Frontend Team', 'Backend Team', 'QA Team', 'DevOps Team'],
  },
  {
    name: 'Product',
    sortOrder: 20,
    teams: ['Product Management (PM)', 'Product Research'],
  },
  {
    name: 'Business Analysis',
    sortOrder: 30,
    teams: ['BA Team', 'Requirement Analysis Team'],
  },
  {
    name: 'Marketing',
    sortOrder: 40,
    teams: ['Digital Marketing Team', 'SEO Team', 'Social Media Team'],
  },
  {
    name: 'HR',
    sortOrder: 50,
    teams: ['Recruitment Team', 'Payroll Team'],
  },
  {
    name: 'Finance',
    sortOrder: 60,
    teams: ['Accounts Team', 'Payroll Finance Team'],
  },
];

/**
 * Uses raw SQL so signup works even if `prisma generate` was not run after adding Department.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {number} organizationId
 */
export async function createOrganizationStructure(prisma, organizationId) {
  for (const dept of DEFAULT_ORG_STRUCTURE) {
    const inserted = await prisma.$queryRaw`
      INSERT INTO "Department" ("name", "organizationId", "sortOrder")
      VALUES (${dept.name}, ${organizationId}, ${dept.sortOrder})
      RETURNING id
    `;
    const deptId = Number(inserted[0].id);

    for (const teamName of dept.teams) {
      await prisma.$executeRaw`
        INSERT INTO "Team" ("name", "organizationId", "departmentId")
        VALUES (${teamName}, ${organizationId}, ${deptId})
      `;
    }
  }
}
