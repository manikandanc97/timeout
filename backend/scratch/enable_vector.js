import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enabling vector extension...');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Success!');
  } catch (err) {
    console.error('Failed to enable extension:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
