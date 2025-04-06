import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LoaderIcon, 
  SearchIcon, 
  RefreshCcw,
  UserCog,
  Mail,
  Calendar,
  ArrowDownIcon,
  ArrowUpIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt: Date;
}

export function UsersManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // This would need a real API endpoint to fetch all users
  // For now, we're using a simulated user list
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create sample users for display
      const sampleUsers: User[] = [
        {
          id: 1,
          username: 'customer',
          email: 'customer@example.com',
          firstName: 'Regular',
          lastName: 'Customer',
          role: 'customer',
          createdAt: new Date('2023-01-15')
        },
        {
          id: 2,
          username: 'admin',
          email: 'admin@kira.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date('2023-01-01')
        }
      ];
      
      setUsers(sampleUsers);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'id') {
      comparison = a.id - b.id;
    } else if (sortField === 'username' || sortField === 'email') {
      comparison = a[sortField].localeCompare(b[sortField]);
    } else {
      // Default sorting by id
      comparison = a.id - b.id;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort toggle
  const handleSortChange = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // View user details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderIcon className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading users. Please try again.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button onClick={fetchUsers} className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {sortedUsers.length} {sortedUsers.length === 1 ? 'user' : 'users'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('id')}>
                      <div className="flex items-center">
                        ID
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('username')}>
                      <div className="flex items-center">
                        Username
                        {sortField === 'username' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('email')}>
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('createdAt')}>
                      <div className="flex items-center">
                        Joined
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{user.id}</td>
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                          ${user.role === 'customer' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-pink-600"
                              onClick={() => handleViewDetails(user)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          {selectedUser && (
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>User Profile</DialogTitle>
                                <DialogDescription>
                                  User ID: #{selectedUser.id}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="bg-gray-100 rounded-full p-3">
                                    <UserCog className="h-6 w-6 text-pink-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">
                                      {selectedUser.firstName} {selectedUser.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3 mt-2">
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{selectedUser.email}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-2">
                                  <div className="font-medium mb-2">Role:</div>
                                  <div className={`
                                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                    ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                                    ${selectedUser.role === 'customer' ? 'bg-blue-100 text-blue-800' : ''}
                                  `}>
                                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setSelectedUser(null)}
                                >
                                  Close
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}