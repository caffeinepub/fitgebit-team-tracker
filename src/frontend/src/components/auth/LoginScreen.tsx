import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState<'assistant' | 'manager' | null>(null);
  const [managerToken, setManagerToken] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    if (!selectedRole) return;
    
    // Store the intended role and token in sessionStorage for post-auth flow
    sessionStorage.setItem('pendingRole', selectedRole);
    if (selectedRole === 'manager') {
      sessionStorage.setItem('pendingToken', managerToken);
    }
    
    await login();
  };

  const canProceed = selectedRole === 'assistant' || (selectedRole === 'manager' && managerToken.trim().length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-2xl border border-teal-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
              <img
                src="/assets/generated/app-logo-tooth.dim_256x256.png"
                alt="Tooth Logo"
                className="w-full h-full object-contain animate-float"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('app.title')}
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t('auth.selectRole')}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedRole('assistant');
                    setManagerToken('');
                  }}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${selectedRole === 'assistant'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-300 dark:ring-teal-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">👤</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('profile.assistant')}</div>
                </button>
                <button
                  onClick={() => setSelectedRole('manager')}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${selectedRole === 'manager'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-300 dark:ring-teal-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">👨‍💼</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('profile.manager')}</div>
                </button>
              </div>
            </div>

            {selectedRole === 'manager' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="token">{t('auth.managerToken')}</Label>
                <Input
                  id="token"
                  type="password"
                  value={managerToken}
                  onChange={(e) => setManagerToken(e.target.value)}
                  placeholder={t('auth.enterToken')}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">{t('auth.tokenRequired')}</p>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || !canProceed}
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
