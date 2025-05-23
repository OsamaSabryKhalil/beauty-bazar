import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import CartIcon from '@/components/CartIcon';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  User, 
  ShoppingBag, 
  Settings
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setHasScrolled(true);
    } else {
      setHasScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavLinkClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={cn(
      "fixed w-full top-0 z-50 transition-all duration-300 bg-white bg-opacity-95",
      hasScrolled ? "shadow-sm" : ""
    )}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold text-kira-purple font-heading">Kira</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="nav-link font-heading text-kira-purple"
                onClick={handleNavLinkClick}
              >
                {link.name}
              </a>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/account" 
                  className="nav-link font-heading text-kira-purple hover:text-kira-coral flex items-center"
                >
                  <User className="w-4 h-4 mr-1" /> Account
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="nav-link font-heading text-kira-purple hover:text-kira-coral flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" /> Admin
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="nav-link font-heading text-kira-purple hover:text-kira-coral flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link font-heading text-kira-purple hover:text-kira-coral flex items-center">
                <User className="w-4 h-4 mr-1" /> Login
              </Link>
            )}
            
            <CartIcon />
          </div>
          
          {/* Mobile Menu Button and Cart Icon */}
          <div className="flex items-center md:hidden space-x-4">
            <CartIcon />
            <button 
              className="text-kira-purple hover:text-kira-coral focus:outline-none" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="py-4 space-y-3 bg-white border-t border-kira-lavender">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="block py-2 px-4 font-heading font-medium text-kira-purple hover:text-kira-coral hover:bg-kira-light rounded-lg transition-colors"
                onClick={handleNavLinkClick}
              >
                {link.name}
              </a>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/account" 
                  className="block py-2 px-4 font-heading font-medium text-kira-purple hover:text-kira-coral hover:bg-kira-light rounded-lg transition-colors flex items-center"
                  onClick={handleNavLinkClick}
                >
                  <User className="w-4 h-4 mr-2" /> My Account
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-2 px-4 font-heading font-medium text-kira-purple hover:text-kira-coral hover:bg-kira-light rounded-lg transition-colors flex items-center"
                    onClick={handleNavLinkClick}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Admin Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 font-heading font-medium text-kira-purple hover:text-kira-coral hover:bg-kira-light rounded-lg transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block py-2 px-4 font-heading font-medium text-kira-purple hover:text-kira-coral hover:bg-kira-light rounded-lg transition-colors flex items-center"
                onClick={handleNavLinkClick}
              >
                <User className="w-4 h-4 mr-2" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
