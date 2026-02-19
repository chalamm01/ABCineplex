import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthCardProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly oauthLabel?: string;
  readonly bottomText: string;
  readonly bottomLink: {
    readonly label: string;
    readonly href: string;
  };
}

export function AuthCard({
  children,
  title,
  description,
  oauthLabel = 'Or continue with',
  bottomText,
  bottomLink,
}: AuthCardProps) {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 p-8 shadow-sm bg-white">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {children}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">{oauthLabel}</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
      >
        <SiGoogle size={20} />
        Sign in with Google
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        {bottomText}{' '}
        <button
          onClick={() => navigate(bottomLink.href)}
          className="font-medium text-black underline"
        >
          {bottomLink.label}
        </button>
      </p>
    </div>
  );
}
