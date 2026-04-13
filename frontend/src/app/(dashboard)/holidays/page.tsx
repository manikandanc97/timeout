import HolidaysPageClient from '@/components/holidays/HolidaysPageClient';
import { getCurrentUser } from '@/services/authService';
import { redirect } from 'next/navigation';

export default async function HolidaysPage() {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/login');
  }

  return <HolidaysPageClient />;
}
