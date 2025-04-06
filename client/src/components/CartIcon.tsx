import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartIcon: React.FC = () => {
  const { cart, getCartItemCount, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

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
    setIsCartOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleCart}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-kira-purple"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6 text-kira-purple" />
        {getCartItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-kira-coral text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {getCartItemCount()}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium text-gray-900">Your Cart</h3>
            <button
              onClick={toggleCart}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>Your cart is empty</p>
                <Button 
                  onClick={toggleCart} 
                  variant="outline" 
                  className="mt-2 text-kira-purple"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center border-b border-gray-100 pb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-kira-purple font-semibold">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 ml-2 text-red-500 hover:text-red-700"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-900">Subtotal</span>
                <span className="text-sm font-semibold text-kira-purple">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-kira-coral hover:bg-opacity-90 text-white"
                >
                  Checkout
                </Button>
                <Link href="/cart" className="w-full">
                  <Button 
                    onClick={toggleCart}
                    variant="outline" 
                    className="w-full text-kira-purple"
                  >
                    View Cart
                  </Button>
                </Link>
                <Button 
                  onClick={toggleCart}
                  variant="link" 
                  className="w-full text-kira-purple"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIcon;