import { AuthBootstrapScreen } from '@/features/auth/auth-bootstrap-screen';
import { useAppBootstrapViewModel } from '@/features/auth/use-app-bootstrap-view-model';
import { AppShell } from '@/features/app-shell/app-shell';

export default function IndexScreen() {
  const { isAppReady, isLoading, setupError } = useAppBootstrapViewModel();

  if (isLoading) {
    return <AuthBootstrapScreen />;
  }

  if (!isAppReady) {
    return <AuthBootstrapScreen errorMessage={setupError} />;
  }

  return <AppShell />;
}
