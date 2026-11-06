import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from '@/features/app-shell/app-shell';
import { AuthBootstrapScreen } from '@/features/auth/auth-bootstrap-screen';
import { AuthProvider } from '@/features/auth/auth-provider';
import { LoginScreen } from '@/features/auth/login-screen';
import { useAppBootstrapViewModel } from '@/features/auth/use-app-bootstrap-view-model';
import { loadAppFonts } from '@/shared/lib/fonts';
import { AppQueryProvider } from '@/shared/lib/query/query-provider';

function AppGate() {
  const { isAppReady, isLoading, needsLogin, setupError } = useAppBootstrapViewModel();

  if (isLoading) {
    return <AuthBootstrapScreen />;
  }

  if (needsLogin) {
    return <LoginScreen />;
  }

  if (!isAppReady) {
    return <AuthBootstrapScreen errorMessage={setupError} />;
  }

  return <AppShell />;
}

export function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // The app still opens if a font fails to load; text falls back to the system font.
    loadAppFonts().finally(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <AuthProvider>
          <AppGate />
        </AuthProvider>
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}
