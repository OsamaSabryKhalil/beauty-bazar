import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-kira-purple text-white py-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-heading">Kira</h3>
            <p className="text-white text-opacity-80 font-body text-sm">
              Premium hair care solutions designed especially for girls who want to look and feel their best.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-white hover:text-kira-coral transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-kira-coral transition-colors">
                <i className="fab fa-tiktok text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-kira-coral transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-kira-coral transition-colors">
                <i className="fab fa-pinterest text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body text-white text-opacity-80">
              <li><a href="#home" className="hover:text-kira-coral transition-colors">Home</a></li>
              <li><a href="#products" className="hover:text-kira-coral transition-colors">Products</a></li>
              <li><a href="#about" className="hover:text-kira-coral transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-kira-coral transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Products</h4>
            <ul className="space-y-2 font-body text-white text-opacity-80">
              <li><a href="#" className="hover:text-kira-coral transition-colors">Shampoos</a></li>
              <li><a href="#" className="hover:text-kira-coral transition-colors">Conditioners</a></li>
              <li><a href="#" className="hover:text-kira-coral transition-colors">Hair Masks</a></li>
              <li><a href="#" className="hover:text-kira-coral transition-colors">Styling Products</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 font-body text-white text-opacity-80">
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-kira-coral"></i>
                <span>hello@kirabeauty.com</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-kira-coral"></i>
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-kira-coral"></i>
                <span>1234 Beauty Blvd, Los Angeles, CA 90001</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-opacity-80 text-sm font-body">
            © {currentYear} Kira. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm font-body text-white text-opacity-80">
            <a href="#" className="hover:text-kira-coral transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-kira-coral transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
