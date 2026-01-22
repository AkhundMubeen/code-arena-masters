import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function MainLayout({ children, requireAdmin = false }: MainLayoutProps) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-mono">Initializing Arena...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
