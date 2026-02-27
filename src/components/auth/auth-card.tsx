import { useNavigate } from 'react-router-dom';

interface AuthCardProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly description: string;
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
  bottomText,
  bottomLink,
}: AuthCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-gray-100 p-8 shadow-sm bg-white">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {children}

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
