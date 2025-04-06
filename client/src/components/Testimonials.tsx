import React from 'react';
import { testimonials } from '@/lib/data';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-kira-purple mb-4 font-heading">What Our Customers Say</h2>
          <p className="text-kira-gray max-w-3xl mx-auto font-body">
            Real stories from girls who love Kira products
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl shadow-md p-6 relative transform transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-5 left-6">
                <div className={`w-10 h-10 ${testimonial.quoteBoxColor} rounded-full flex items-center justify-center`}>
                  <i className="fas fa-quote-right text-white"></i>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-kira-gray mb-6 font-body italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.authorImage} 
                    alt={testimonial.authorName} 
                    className="w-10 h-10 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-heading font-semibold text-kira-purple">{testimonial.authorName}</h4>
                    <div className="flex text-kira-coral text-sm">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                      {testimonial.halfStar && (
                        <i className="fas fa-star-half-alt"></i>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
