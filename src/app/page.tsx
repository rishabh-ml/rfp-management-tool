import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to dashboard for authenticated users
  redirect('/dashboard')
}
