import { auth } from '@/lib/auth';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';

export default async function Page() {
    const session = await auth();
    return <SuperAdminDashboard user={session!.user} />;
}
