import { redirect } from 'next/navigation';

export default function TeamsRoutePage() {
  redirect('/dashboard?tab=teams');
}
