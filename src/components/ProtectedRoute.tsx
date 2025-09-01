import { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import { Loader2 } from 'lucide-react';
import SharkLogo from './SharkLogo';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-shark-dark-bg">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <SharkLogo className="h-16 w-auto mx-auto animate-pulse" />
            <div className="flex items-center space-x-2 text-shark-dark dark:text-white">
              <Loader2 className="h-5 w-5 animate-spin text-shark-primary" />
              <span className="font-inter font-medium">Carregando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;