import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/contact', data);
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
        variant: "default",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-kira-light">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-kira-purple mb-4 font-heading">Get In Touch</h2>
            <p className="text-kira-gray font-body">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-kira-purple font-heading font-medium mb-2">Your Name</label>
                <input 
                  type="text"
                  id="name"
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kira-coral focus:ring focus:ring-kira-pink focus:ring-opacity-30 outline-none transition"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-kira-purple font-heading font-medium mb-2">Email Address</label>
                <input 
                  type="email"
                  id="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kira-coral focus:ring focus:ring-kira-pink focus:ring-opacity-30 outline-none transition"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-kira-purple font-heading font-medium mb-2">Your Message</label>
                <textarea 
                  id="message"
                  {...register('message')}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kira-coral focus:ring focus:ring-kira-pink focus:ring-opacity-30 outline-none transition"
                  placeholder="Type your message here..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>
              
              <div className="flex justify-center">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-kira-coral hover:bg-opacity-90 text-white font-heading font-semibold px-8 py-3 rounded-full transition transform hover:scale-105 shadow-lg w-full sm:w-auto disabled:opacity-70"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
