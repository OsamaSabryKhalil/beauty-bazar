import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="hero-bg min-h-screen flex items-center pt-16 md:pt-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-heading">
            Discover Premium Hair Care Products
          </h1>
          <p className="text-lg md:text-xl text-white opacity-90 mb-8 font-body">
            Unleash your beauty with our collection specially crafted for gorgeous, healthy hair that lets your confidence shine.
          </p>
          <a 
            href="#products" 
            className="inline-block bg-kira-coral hover:bg-opacity-90 text-white font-heading font-semibold px-8 py-3 rounded-full transition transform hover:scale-105 shadow-lg"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
