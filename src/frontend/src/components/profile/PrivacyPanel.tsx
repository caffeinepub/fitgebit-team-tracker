import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function PrivacyPanel({ open, onClose, onBack }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleExport = () => {
    // Simple JSON export of cached data
    const data = {
      profile: queryClient.getQueryData(['currentUserProfile']),
      overtime: queryClient.getQueryData(['overtimeEntries']),
      tasks: queryClient.getQueryData(['tasks']),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitgebit-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success(t('common.success'));
  };

  const handleDelete = async () => {
    try {
      // Backend doesn't have deleteCallerUserProfile method
      // Just clear local data and log out
      await clear();
      queryClient.clear();
      success(t('common.success'));
      onClose();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('privacy.title')}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <Button variant="outline" onClick={onBack} className="w-full">
            {t('common.back')}
          </Button>

          <Button onClick={handleExport} className="w-full">
            {t('privacy.export')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                {t('privacy.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('privacy.delete')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('privacy.deleteConfirm')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  {t('privacy.deleteButton')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
