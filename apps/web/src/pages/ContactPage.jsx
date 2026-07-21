import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: 'General Inquiry',
    message: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      await pb.collection('contact_submissions').create({
        ...formData,
        status: 'New',
        submittedAt: new Date().toISOString()
      }, { $autoCancel: false });

      toast.success('Thank you! Your message has been received.');
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        inquiryType: 'General Inquiry',
        message: ''
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Helmet>
        <title>Contact - Roham Carrion Platform</title>
        <meta name="description" content="Get in touch for project proposals, partnerships, or general inquiries." />
      </Helmet>

      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-secondary/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            {/* Left Column: Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 lg:sticky lg:top-32 pt-8"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Whether you have a project proposal, partnership opportunity, or just a general inquiry, I'd love to hear from you. Fill out the form and I'll get back to you as soon as possible.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">hello@rohamcarrion.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">San Francisco, CA<br/>Available for remote opportunities worldwide.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-lg shadow-primary/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="name" 
                        placeholder="Jane Doe" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="h-12 rounded-xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="jane@example.com" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="h-12 rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="h-12 rounded-xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type <span className="text-destructive">*</span></Label>
                      <Select 
                        value={formData.inquiryType} 
                        onValueChange={(val) => handleChange('inquiryType', val)}
                        required
                      >
                        <SelectTrigger id="inquiryType" className="h-12 rounded-xl bg-background">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                          <SelectItem value="Project Proposal">Project Proposal</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help you?" 
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                      className="h-12 rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..." 
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      className="min-h-[150px] rounded-xl bg-background resize-y"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                    className="w-full h-14 rounded-xl text-base shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </span>
                    )}
                  </Button>

                </form>
              </div>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ContactPage;