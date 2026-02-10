import { useInternetIdentity } from './hooks/useInternetIdentity';
import { I18nProvider } from './i18n/I18nProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AuthenticatedAppFlow from './components/auth/AuthenticatedAppFlow';
import LoginScreen from './components/auth/LoginScreen';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !isInitializing;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
              <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
            </div>
          </div>
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <LoginScreen />
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <AuthenticatedAppFlow />
        <Toaster />
      </I18nProvider>
    </ThemeProvider>
  );
}
