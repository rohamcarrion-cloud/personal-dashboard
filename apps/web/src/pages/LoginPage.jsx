import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useBranding } from '@/contexts/BrandingContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/portal/command-center/overview');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const brandName = branding?.platformName || 'Platform';
  const customColorStyle = branding?.primaryColor ? { backgroundColor: branding.primaryColor, color: '#ffffff' } : {};

  return (
    <>
      <Helmet>
        <title>Login - {brandName}</title>
        <meta name="description" content="Secure login access to the platform command center." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        
        <div className="absolute top-8 left-8 z-10">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>

        {/* Decorative background blob */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div 
            className="w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20" 
            style={branding?.primaryColor ? { backgroundColor: branding.primaryColor } : { backgroundColor: 'var(--primary)' }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <Card className="w-full max-w-[400px] border-border shadow-xl shadow-primary/5 rounded-3xl overflow-hidden bg-card">
            <div 
              className="h-2 w-full" 
              style={branding?.primaryColor ? { backgroundColor: branding.primaryColor } : { backgroundImage: 'linear-gradient(to right, var(--primary), var(--primary))' }}
            />
            <CardHeader className="text-center pt-10 pb-6">
              {branding?.logoUrl ? (
                <div className="mx-auto mb-6 h-16 flex items-center justify-center">
                   <img src={branding.logoUrl} alt="Logo" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-border/50">
                  <Lock className="w-7 h-7" style={branding?.primaryColor ? { color: branding.primaryColor } : { color: 'var(--primary)' }} />
                </div>
              )}
              <CardTitle className="text-3xl font-bold tracking-tight">Command Center</CardTitle>
              <CardDescription className="text-base mt-2">Sign in to manage {brandName}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="h-12 rounded-xl text-foreground bg-background border-border/50 focus-visible:ring-primary focus-visible:border-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link to="#" className="text-xs font-medium hover:underline" style={branding?.primaryColor ? { color: branding.primaryColor } : { color: 'var(--primary)' }}>Forgot password?</Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl text-foreground bg-background border-border/50 focus-visible:ring-primary focus-visible:border-primary"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start">
                    <span className="block">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-200" 
                  disabled={loading}
                  style={customColorStyle}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;