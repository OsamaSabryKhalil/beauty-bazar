import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsManager } from '@/components/admin/ProductsManager';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // Check if user is logged in and is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation('/login');
      return;
    }

    // Check if the token is valid and the user is an admin
    const checkAdmin = async () => {
      try {
        // Simple token payload check (in a real app, you'd verify with the server)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') {
          throw new Error('Not authorized');
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        setLocation('/login');
      }
    };

    checkAdmin();
  }, [setLocation]);

  return (
    <AdminLayout>
      <ProductsManager />
    </AdminLayout>
  );
}