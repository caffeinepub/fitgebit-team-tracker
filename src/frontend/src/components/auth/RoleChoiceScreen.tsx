import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useSelectRoleAssistant, useSelectRoleManager } from '../../hooks/useRoleSelection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoleChoiceScreen() {
  const { t } = useI18n();
  const { handleError } = useNotify();
  const { mutateAsync: selectAssistant, isPending: isSelectingAssistant } = useSelectRoleAssistant();
  const { mutateAsync: selectManager, isPending: isSelectingManager } = useSelectRoleManager();

  const [selectedRole, setSelectedRole] = useState<'assistant' | 'manager' | null>(null);
  const [managerToken, setManagerToken] = useState('');

  // Check for pre-auth persisted role choice
  useEffect(() => {
    const pendingRole = sessionStorage.getItem('pendingRole') as 'assistant' | 'manager' | null;
    const pendingToken = sessionStorage.getItem('pendingToken') || '';
    
    if (pendingRole) {
      setSelectedRole(pendingRole);
      if (pendingRole === 'manager') {
        setManagerToken(pendingToken);
      }
      // Clear after reading
      sessionStorage.removeItem('pendingRole');
      sessionStorage.removeItem('pendingToken');
    }
  }, []);

  const handleConfirm = async () => {
    if (!selectedRole) return;

    try {
      if (selectedRole === 'assistant') {
        await selectAssistant();
      } else {
        await selectManager(managerToken);
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  const isPending = isSelectingAssistant || isSelectingManager;
  const canProceed = selectedRole === 'assistant' || (selectedRole === 'manager' && managerToken.trim().length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.selectYourRole')}</CardTitle>
          <CardDescription>{t('auth.roleChoiceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('auth.selectRole')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedRole('assistant');
                  setManagerToken('');
                }}
                disabled={isPending}
                className={`
                  p-4 rounded-xl border-2 transition-all text-center
                  ${selectedRole === 'assistant'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-300 dark:ring-teal-700'
                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-2xl mb-1">👤</div>
                <div className="font-semibold text-gray-900 dark:text-white">{t('profile.assistant')}</div>
              </button>
              <button
                onClick={() => setSelectedRole('manager')}
                disabled={isPending}
                className={`
                  p-4 rounded-xl border-2 transition-all text-center
                  ${selectedRole === 'manager'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-300 dark:ring-teal-700'
                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
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
                disabled={isPending}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">{t('auth.tokenRequired')}</p>
            </div>
          )}

          <Button
            onClick={handleConfirm}
            disabled={isPending || !canProceed}
            className="w-full h-12"
          >
            {isPending ? t('common.loading') : t('auth.confirmRole')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
