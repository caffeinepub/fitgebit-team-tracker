import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface Props {
  onConfirmed: () => void;
}

export default function FirstManagerConfirmDialog({ onConfirmed }: Props) {
  const { actor } = useActor();
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!actor) return;
    
    setIsConfirming(true);
    try {
      // The backend auto-assigns admin role on first call
      // We just need to trigger any admin-requiring call or wait for role refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      success(t('common.success'));
      onConfirmed();
    } catch (error) {
      handleError(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('manager.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('manager.confirmMessage')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? t('common.loading') : t('manager.confirmButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
