import { auth } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  const session = await auth();

  // Always show the landing page — authenticated users get a "Go to Dashboard" CTA
  return <LandingPage user={session?.user} />;
}
