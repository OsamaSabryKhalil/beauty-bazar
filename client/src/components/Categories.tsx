import React from 'react';

const Categories: React.FC = () => {
  const categories = [
    {
      id: 1,
      title: 'Shampoos',
      description: 'Gentle cleansing formulas for all hair types',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bgColor: 'bg-kira-pink bg-opacity-30',
    },
    {
      id: 2,
      title: 'Conditioners',
      description: 'Nourishing care for silky smooth results',
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bgColor: 'bg-kira-lavender bg-opacity-50',
    },
    {
      id: 3,
      title: 'Styling Products',
      description: 'Creative tools for your perfect look',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bgColor: 'bg-kira-pink bg-opacity-30',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-kira-light">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-kira-purple mb-4 font-heading">Discover Our Collections</h2>
          <p className="text-kira-gray max-w-3xl mx-auto font-body">
            Find the perfect hair care routine tailored just for you
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl overflow-hidden shadow-md bg-white transform transition-all duration-300 hover:-translate-y-1">
              <div className={`h-48 ${category.bgColor} flex items-center justify-center`}>
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="h-40 w-auto object-contain mix-blend-multiply"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-kira-purple mb-2">{category.title}</h3>
                <p className="text-kira-gray mb-4 font-body text-sm">{category.description}</p>
                <a href="#products" className="text-kira-coral font-heading font-medium hover:text-opacity-80 inline-flex items-center">
                  Explore <i className="fas fa-chevron-right ml-2 text-xs"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
