// seedAdmin.js

import prisma from './src/prismaClient.js';
import bcrypt from 'bcrypt';

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

createAdmin();
