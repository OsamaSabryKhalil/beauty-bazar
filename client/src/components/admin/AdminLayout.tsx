import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  UserCog
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLocation('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md h-full fixed">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-pink-600">Kira Admin</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin')}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin')}
            >
              <Package className="mr-2 h-5 w-5" />
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin/orders')}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin/users')}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin/settings')}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/admin/profile')}
            >
              <UserCog className="mr-2 h-5 w-5" />
              My Profile
            </Button>
          </div>
          <div className="px-4 mt-8">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              onClick={() => setLocation('/')}
            >
              View Store
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 mt-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}