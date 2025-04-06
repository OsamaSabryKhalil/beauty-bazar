import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'wouter';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart first",
        variant: "destructive",
      });
      return;
    }
    
    // For now, just show a success message - we'll implement actual checkout later
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase",
    });
    clearCart();
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl">
      <h1 className="text-3xl font-bold text-kira-purple mb-8 font-heading">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-10 flex flex-col items-center justify-center">
          <div className="bg-kira-lavender/30 rounded-full p-6 inline-block mb-4">
            <Trash2 className="h-8 w-8 text-kira-purple" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-3 font-heading">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/">
            <Button 
              className="bg-kira-coral hover:bg-opacity-90 text-white"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Product</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Price</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Total</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-kira-purple">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-kira-purple">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Link to="/">
                <Button variant="outline" className="text-kira-purple">
                  Continue Shopping
                </Button>
              </Link>
              <Button 
                onClick={clearCart}
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 font-heading">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-kira-purple font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-kira-purple font-medium">$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-bold text-kira-purple">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="mt-6 w-full bg-kira-coral hover:bg-opacity-90 text-white py-3"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;