import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersManager } from '@/components/admin/UsersManager';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Protect the users route
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (!isAdmin) {
      setLocation('/');
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  if (!isAuthenticated || !isAdmin) {
    return null; // Don't render anything until the redirect happens
  }

  return (
    <AdminLayout>
      <UsersManager />
    </AdminLayout>
  );
}