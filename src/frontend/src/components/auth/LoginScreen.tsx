import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useI18n();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-2xl border border-teal-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('app.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('app.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-gray-700 dark:text-gray-300">
              {t('auth.loginPrompt')}
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
            >
              {isLoggingIn ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
