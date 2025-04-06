import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BarChart3,
  ShoppingBag,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: any[];
  topSellingProducts: any[];
  salesByCategory: any[];
  revenueByMonth: any[];
  userGrowth: any[];
  newUsers: number;
  revenueGrowth: number;
  orderGrowth: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#AB83A1', '#F15BB5', '#9B5DE5'];

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      try {
        const response = await apiRequest<DashboardData>('/api/admin/dashboard');
        console.log('Dashboard data loaded:', response);
        return response;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please make sure you are logged in as admin.',
          variant: 'destructive',
        });
        // Don't return null to allow proper error handling
        throw error;
      }
    }
  });

  // Use actual data from API and provide empty defaults when data doesn't exist
  const dashboardData: DashboardData = {
    totalUsers: data?.totalUsers || 0,
    totalOrders: data?.totalOrders || 0,
    totalProducts: data?.totalProducts || 0,
    totalRevenue: data?.totalRevenue || 0,
    newUsers: data?.newUsers || 0,
    revenueGrowth: data?.revenueGrowth || 0,
    orderGrowth: data?.orderGrowth || 0,
    recentOrders: Array.isArray(data?.recentOrders) && data?.recentOrders.length > 0 ? data.recentOrders : [],
    topSellingProducts: Array.isArray(data?.topSellingProducts) && data?.topSellingProducts.length > 0 ? data.topSellingProducts : [],
    salesByCategory: Array.isArray(data?.salesByCategory) && data?.salesByCategory.length > 0 ? data.salesByCategory : [],
    revenueByMonth: Array.isArray(data?.revenueByMonth) && data?.revenueByMonth.length > 0 ? data.revenueByMonth : [],
    userGrowth: Array.isArray(data?.userGrowth) && data?.userGrowth.length > 0 ? data.userGrowth : []
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-2xl font-extrabold text-pink-600">Error Loading Dashboard</h1>
          <p className="mb-4 text-gray-500">We're unable to load your dashboard data. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Helper function to safely handle data arrays
  const isValidArray = (arr: any): boolean => {
    return arr && Array.isArray(arr) && arr.length > 0;
  };

  // Calculate total revenue from recent orders if available
  const recentOrdersRevenue = isValidArray(dashboardData.recentOrders)
    ? dashboardData.recentOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    : 0;
  
  // Calculate average order value
  const averageOrderValue = (dashboardData.totalOrders && dashboardData.totalRevenue)
    ? ((dashboardData.totalRevenue || 0) / dashboardData.totalOrders).toFixed(2) 
    : "0.00";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Users" 
              value={dashboardData.totalUsers} 
              description={`+${dashboardData.newUsers} new users`}
              icon={<Users className="h-6 w-6" />} 
              trend={dashboardData.newUsers > 0 ? "up" : "down"}
            />
            <StatsCard 
              title="Total Orders" 
              value={dashboardData.totalOrders} 
              description={`${dashboardData.orderGrowth}% increase`}
              icon={<ShoppingBag className="h-6 w-6" />} 
              trend="up"
            />
            <StatsCard 
              title="Products" 
              value={dashboardData.totalProducts} 
              description="Active products"
              icon={<Package className="h-6 w-6" />} 
              trend="neutral"
            />
            <StatsCard 
              title="Revenue" 
              value={`$${dashboardData.totalRevenue ? dashboardData.totalRevenue.toLocaleString() : '0'}`} 
              description={`${dashboardData.revenueGrowth || 0}% increase`}
              icon={<DollarSign className="h-6 w-6" />} 
              trend="up"
            />
          </div>
          
          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue for the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.revenueByMonth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#FF6B6B" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={isValidArray(dashboardData.salesByCategory) ? dashboardData.salesByCategory : []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {isValidArray(dashboardData.salesByCategory) ?
                          dashboardData.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))
                          : null
                        }
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders && Array.isArray(dashboardData.recentOrders) ? 
                      dashboardData.recentOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                          <td className="px-6 py-4">{order.customer}</td>
                          <td className="px-6 py-4">{order.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No recent orders to display</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.totalRevenue ? dashboardData.totalRevenue.toLocaleString() : '0'}</div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardData.revenueGrowth || 0}% from last month
                </p>
                <div className="mt-4 h-1">
                  <Progress value={dashboardData.revenueGrowth || 0} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${averageOrderValue}</div>
                <p className="text-xs text-muted-foreground">
                  Per order average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.5% from last week
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trends over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.revenueByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4ECDC4" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with the highest sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Units Sold</th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isValidArray(dashboardData.topSellingProducts) ? 
                      dashboardData.topSellingProducts.map((product) => (
                        <tr 
                          key={product.id} 
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                          <td className="px-6 py-4">{product.sales}</td>
                          <td className="px-6 py-4">${product.revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 w-1/4">
                            <div className="flex items-center">
                              <Progress 
                                value={product.sales / dashboardData.topSellingProducts[0].sales * 100} 
                                className="h-2" 
                              />
                              <span className="ml-2 text-xs">
                                {(product.sales / dashboardData.topSellingProducts[0].sales * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No product data available</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard 
              title="Total Products" 
              value={dashboardData.totalProducts} 
              description="Active products"
              icon={<Package className="h-6 w-6" />} 
              trend="neutral"
            />
            <StatsCard 
              title="Top Category" 
              value="Shampoo" 
              description="35% of total sales"
              icon={<BarChart3 className="h-6 w-6" />} 
              trend="up"
            />
            <StatsCard 
              title="Product Revenue" 
              value={`$${dashboardData.totalRevenue ? dashboardData.totalRevenue.toLocaleString() : '0'}`} 
              description="From all products"
              icon={<DollarSign className="h-6 w-6" />} 
              trend="up"
            />
          </div>
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Sales distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={isValidArray(dashboardData.salesByCategory) ? dashboardData.salesByCategory : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {isValidArray(dashboardData.salesByCategory) ? 
                        dashboardData.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                        : null
                      }
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Sales and revenue by product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Units Sold</th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isValidArray(dashboardData.topSellingProducts) ? 
                      dashboardData.topSellingProducts.map((product) => (
                        <tr 
                          key={product.id} 
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                          <td className="px-6 py-4">{product.sales}</td>
                          <td className="px-6 py-4">${product.revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 w-1/4">
                            <div className="flex items-center">
                              <Progress 
                                value={product.sales / dashboardData.topSellingProducts[0].sales * 100} 
                                className="h-2" 
                              />
                              <span className="ml-2 text-xs">
                                {(product.sales / dashboardData.topSellingProducts[0].sales * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No product data available</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard 
              title="Total Customers" 
              value={dashboardData.totalUsers} 
              description={`+${dashboardData.newUsers} new users`}
              icon={<Users className="h-6 w-6" />} 
              trend="up"
            />
            <StatsCard 
              title="Avg. Spend" 
              value={`$${(dashboardData.totalRevenue && dashboardData.totalUsers) ? 
                (dashboardData.totalRevenue / dashboardData.totalUsers).toFixed(2) : '0.00'}`} 
              description="Per customer"
              icon={<DollarSign className="h-6 w-6" />} 
              trend="up"
            />
            <StatsCard 
              title="Retention Rate" 
              value="68%" 
              description="+5% from last month"
              icon={<TrendingUp className="h-6 w-6" />} 
              trend="up"
            />
          </div>
          
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>User acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.userGrowth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#6A0572" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                      name="Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Spent</th>
                      <th className="px-6 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders && Array.isArray(dashboardData.recentOrders) ? 
                      dashboardData.recentOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                          <td className="px-6 py-4">{Math.floor(Math.random() * 5) + 1}</td>
                          <td className="px-6 py-4">${(order.total * (Math.floor(Math.random() * 3) + 1)).toFixed(2)}</td>
                          <td className="px-6 py-4">{order.date}</td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No recent customers to display</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-pink-100 p-1 text-pink-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === 'up' && <TrendingUp className="text-green-500 h-3 w-3 mr-1" />}
          {trend === 'down' && <TrendingUp className="text-red-500 h-3 w-3 mr-1 rotate-180" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}