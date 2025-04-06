import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  UserCog,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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
              variant={location === '/admin/dashboard' ? 'default' : 'ghost'}
              className={`w-full justify-start ${location === '/admin/dashboard' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
              onClick={() => setLocation('/admin/dashboard')}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant={location === '/admin' ? 'default' : 'ghost'}
              className={`w-full justify-start ${location === '/admin' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
              onClick={() => setLocation('/admin')}
            >
              <Package className="mr-2 h-5 w-5" />
              Products
            </Button>
            <Button
              variant={location === '/admin/orders' ? 'default' : 'ghost'}
              className={`w-full justify-start ${location === '/admin/orders' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
              onClick={() => setLocation('/admin/orders')}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders
            </Button>
            <Button
              variant={location === '/admin/users' ? 'default' : 'ghost'}
              className={`w-full justify-start ${location === '/admin/users' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
              onClick={() => setLocation('/admin/users')}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
            <Button
              variant={location === '/admin/profile' ? 'default' : 'ghost'}
              className={`w-full justify-start ${location === '/admin/profile' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
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
              <Home className="mr-2 h-5 w-5" />
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