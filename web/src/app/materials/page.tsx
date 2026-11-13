import { redirect } from 'next/navigation';

export default function MaterialsRoutePage() {
  redirect('/dashboard?tab=materials');
}
