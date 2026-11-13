import { redirect } from 'next/navigation';

export default function TasksRoutePage() {
  redirect('/dashboard?tab=team_tasks');
}
