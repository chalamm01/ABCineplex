"use client"

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export interface SocialProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
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

const defaultProviders: SocialProvider[] = [
  {
    id: 'google',
    name: 'Continue with Google',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    onClick: () => console.log('Google login')
  }
];

export function SocialLogin({
  title = 'Welcome back',
  description = 'Choose your preferred sign in method',
  providers = defaultProviders,
  onEmailLogin,
  onSignUp,
  isLoading = false,
  className
}: SocialLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      navigate('/register');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin?.({ email, password });
  };

  return (
    <div className={cn("bg-[url('/public/assets/background/bg.png')] bg-cover bg-center", className)}>
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
          {/* Social Login Buttons */}
          {providers.length > 0 && (
            <div className="space-y-3">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  onClick={provider.onClick}
                  className="w-full justify-center gap-3 border-border/50 hover:bg-muted/50 transition-colors"
                  disabled={isLoading}
                >
                  {provider.icon}
                  {provider.name}
                </Button>
              ))}
            </div>
          )}

          {providers.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
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
                  onClick={onSignUp}
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
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign in with email'}
            </Button>
          </form>

            <div className="text-center pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSignUp}
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