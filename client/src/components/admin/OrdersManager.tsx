import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LoaderIcon, 
  SearchIcon, 
  SlidersHorizontal,
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Define Order types
interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: Date;
  product?: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
  user?: {
    username: string;
    email: string;
  };
}

export function OrdersManager() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fetch orders
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['/orders'],
    queryFn: async () => {
      const response = await apiRequest('/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response as Order[];
    },
  });
  
  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      return apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: { status }
      });
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['/orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive"
      });
    }
  });
  
  // Filter and sort orders
  const filteredOrders = orders ? orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) || 
      order.user_id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'created_at' || sortField === 'updated_at') {
      comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
    } else if (sortField === 'total_amount') {
      comparison = a.total_amount - b.total_amount;
    } else if (sortField === 'id') {
      comparison = a.id - b.id;
    } else {
      // Default sorting by id
      comparison = a.id - b.id;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort toggle
  const handleSortChange = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // View order details
  const handleViewDetails = async (order: Order) => {
    try {
      // Fetch detailed order data
      const detailedOrder = await apiRequest(`/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }) as Order;
      
      setSelectedOrder(detailedOrder);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    }
  };
  
  // Update order status
  const handleStatusChange = (status: string) => {
    if (!selectedOrder) return;
    
    updateOrderStatus.mutate({ 
      orderId: selectedOrder.id, 
      status 
    });
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
        Error loading orders. Please try again.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID or customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={`${sortField}-${sortDirection}`} 
              onValueChange={(val) => {
                const [field, direction] = val.split('-');
                setSortField(field as keyof Order);
                setSortDirection(direction as 'asc' | 'desc');
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <span>Sort By</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Date (Newest First)</SelectItem>
                <SelectItem value="created_at-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="total_amount-desc">Amount (High to Low)</SelectItem>
                <SelectItem value="total_amount-asc">Amount (Low to High)</SelectItem>
                <SelectItem value="id-desc">Order ID (Highest First)</SelectItem>
                <SelectItem value="id-asc">Order ID (Lowest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('id')}>
                      <div className="flex items-center">
                        Order ID
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('created_at')}>
                      <div className="flex items-center">
                        Date
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Customer ID</th>
                    <th className="text-left py-3 px-4 font-medium cursor-pointer" onClick={() => handleSortChange('total_amount')}>
                      <div className="flex items-center">
                        Amount
                        {sortField === 'total_amount' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{order.id}</td>
                      <td className="py-3 px-4">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">#{order.user_id}</td>
                      <td className="py-3 px-4">${order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-pink-600"
                              onClick={() => handleViewDetails(order)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          {selectedOrder && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                                <DialogDescription>
                                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Status:</div>
                                  <div className="col-span-3">
                                    <Select 
                                      defaultValue={selectedOrder.status} 
                                      onValueChange={handleStatusChange}
                                      disabled={updateOrderStatus.isPending}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Customer:</div>
                                  <div className="col-span-3">ID: {selectedOrder.user_id}</div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="font-medium">Total Amount:</div>
                                  <div className="col-span-3">${selectedOrder.total_amount.toFixed(2)}</div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="font-medium">Order Items:</div>
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="text-left py-2 px-4">Item ID</th>
                                          <th className="text-left py-2 px-4">Product ID</th>
                                          <th className="text-right py-2 px-4">Quantity</th>
                                          <th className="text-right py-2 px-4">Unit Price</th>
                                          <th className="text-right py-2 px-4">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedOrder.items && selectedOrder.items.map((item) => (
                                          <tr key={item.id} className="border-b">
                                            <td className="py-2 px-4">#{item.id}</td>
                                            <td className="py-2 px-4">#{item.product_id}</td>
                                            <td className="py-2 px-4 text-right">{item.quantity}</td>
                                            <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
                                            <td className="py-2 px-4 text-right">
                                              ${(item.price * item.quantity).toFixed(2)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setSelectedOrder(null)}
                                >
                                  Close
                                </Button>
                                <Button 
                                  type="button" 
                                  onClick={() => handleStatusChange(selectedOrder.status)}
                                  disabled={updateOrderStatus.isPending}
                                >
                                  {updateOrderStatus.isPending ? (
                                    <>
                                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Update Order'
                                  )}
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
              No orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}