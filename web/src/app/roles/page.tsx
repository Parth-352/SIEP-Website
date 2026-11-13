import { redirect } from 'next/navigation';

export default function RolesRoutePage() {
  redirect('/dashboard?tab=roles');
}
