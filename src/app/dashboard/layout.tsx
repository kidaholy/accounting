import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
    title: 'Dashboard | Hisabe',
    description: 'Manage your accounting securely.',
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect all /dashboard routes
    if (!session) {
        redirect('/login');
    }

    return <>{children}</>;
}
