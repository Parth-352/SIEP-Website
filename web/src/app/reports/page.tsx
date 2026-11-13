import { redirect } from 'next/navigation';

export default function ReportsRoutePage() {
  redirect('/dashboard?tab=metrics');
}
