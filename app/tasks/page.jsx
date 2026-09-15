import { redirect } from 'next/navigation';

export default function TasksIndexRedirect() {
  redirect('/tasks/board');
}
