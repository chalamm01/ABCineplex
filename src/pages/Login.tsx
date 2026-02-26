import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authApi } from '@/services/api';
import { Spinner } from '@/components/ui/spinner'

export interface SocialProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  onClick: () => void | Promise<void>;
}

export interface SocialLoginProps {
  title?: string;
  description?: string;
  providers?: SocialProvider[];
  onEmailLogin?: (data: { email: string; password: string }) => void;
  onSignUp?: () => void;
  isLoading?: boolean;
  className?: string;
}


export function SocialLogin({
  title = 'Welcome back',
  description = 'Sign in to your account',
  className
}: Readonly<SocialLoginProps>) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.token);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("bg-[url('/assets/background/bg.png')] bg-cover bg-center", className)}>
      <div className="flex items-center justify-center min-h-screen p-6  bg-white/70 backdrop-blur-md">
      <Card className="w-full max-w-sm border border-border/50 shadow-sm bg-card backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 rounded-md p-2">
              {error}
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className='flex space-x-34'>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-muted-foreground hover:text-primary/80 transition-colors font-medium text-xs"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (<><Spinner className="mr-2" /> Signing in...</>) : 'Sign in with email'}
            </Button>
          </form>

            <div className="text-center pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </button>
              </span>
            </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

export default SocialLogin;