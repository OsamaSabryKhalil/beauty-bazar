import React from 'react';
import { products } from '@/lib/data';

const Products: React.FC = () => {
  return (
    <section id="products" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-kira-purple mb-4 font-heading">Trending Products</h2>
          <p className="text-kira-gray max-w-3xl mx-auto font-body">
            Our most loved hair care solutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className={`relative h-56 ${product.bgGradient} flex items-center justify-center p-4`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-48 w-auto object-contain mix-blend-multiply"
                />
                {product.badge && (
                  <div className={`absolute top-3 right-3 ${product.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    {product.badge}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-kira-purple mb-1">{product.name}</h3>
                <p className="text-sm text-kira-gray mb-3 font-body">{product.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-kira-purple font-semibold">${product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="text-gray-400 text-sm line-through ml-2">${product.oldPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <button className="bg-kira-coral hover:bg-opacity-90 text-white font-heading text-sm font-medium px-4 py-2 rounded-full transition transform hover:scale-105">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="inline-block bg-white border-2 border-kira-coral text-kira-coral hover:bg-kira-coral hover:text-white font-heading font-semibold px-8 py-3 rounded-full transition duration-300">
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default Products;
