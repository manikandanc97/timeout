import { vi } from 'vitest';

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
  },
  leave: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    aggregate: vi.fn(),
  },
  leaveBalance: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
  },
  salaryStructure: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
  },
  payroll: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  permissionRequest: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  compOffWorkLog: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((cb) => cb(mockPrisma)),
};

vi.mock('../src/prismaClient.js', () => ({
  default: mockPrisma,
}));
