export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type Role = 'ADMIN' | 'EMPLOYEE' | 'MANAGER' | 'HR';

export interface User {
  id: number;
  name: string;
  email: string;
  gender?: Gender | string;
  role?: Role | string;
}
