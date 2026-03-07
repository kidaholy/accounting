import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
    title: 'Super Admin | Hisabe',
    description: 'System-wide management for Hisabe.',
};

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || session.user.role !== 'super_admin') {
        redirect('/login');
    }

    return (
        <div style={{ background: '#F3F1EA', minHeight: '100vh' }}>
            {children}
        </div>
    );
}
