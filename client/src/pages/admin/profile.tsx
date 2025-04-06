import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProfileManager } from '@/components/admin/ProfileManager';

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <ProfileManager />
    </AdminLayout>
  );
}