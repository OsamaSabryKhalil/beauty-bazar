import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-kira-light">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560869713-da86a9ec94e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Happy girl with beautiful hair" 
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-kira-pink rounded-2xl p-4 shadow-lg hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80" 
                  alt="Product detail" 
                  className="w-32 h-32 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <span className="text-kira-coral font-heading font-semibold">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-bold text-kira-purple mt-2 mb-6 font-heading">About Kira</h2>
            <p className="text-kira-gray mb-4 font-body">
              Kira is dedicated to providing high-quality, stylish hair care solutions for women, with a special emphasis on products that girls love. We believe that beautiful hair is the foundation of confidence and self-expression.
            </p>
            <p className="text-kira-gray mb-6 font-body">
              Founded with a passion for creating products that celebrate individuality, Kira offers formulas that nourish, protect, and enhance your natural beauty. Our ingredients are carefully selected to deliver professional results with a touch of fun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="flex items-center">
                <div className="bg-kira-coral rounded-full p-2 mr-3 text-white">
                  <i className="fas fa-check"></i>
                </div>
                <span className="font-heading font-medium">Cruelty-Free</span>
              </div>
              <div className="flex items-center">
                <div className="bg-kira-coral rounded-full p-2 mr-3 text-white">
                  <i className="fas fa-check"></i>
                </div>
                <span className="font-heading font-medium">Sustainable Packaging</span>
              </div>
              <div className="flex items-center">
                <div className="bg-kira-coral rounded-full p-2 mr-3 text-white">
                  <i className="fas fa-check"></i>
                </div>
                <span className="font-heading font-medium">Sulfate-Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
