import { AuthScreen } from '@/features/auth/auth-screen';
import { useAuth } from '@/features/auth/use-auth';
import { AppShell } from '@/features/app-shell/app-shell';

export default function IndexScreen() {
  const { session } = useAuth();

  if (session) {
    return <AppShell />;
  }

  return <AuthScreen />;
}
