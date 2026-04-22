import bcrypt from 'bcrypt';
import prisma from '../src/prismaClient.js';

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@timeout.com',
      password: hashedPassword,
      role: 'ADMIN',
      gender: 'MALE',
    },
  });

  console.log('Admin created successfully');
}

createAdmin()
  .catch((error) => {
    console.error('Failed to seed admin:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
