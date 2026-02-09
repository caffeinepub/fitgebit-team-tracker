import { toast } from 'sonner';
import { useI18n } from './useI18n';

export function useNotify() {
  const { t } = useI18n();

  const success = (message: string) => {
    toast.success(message);
  };

  const error = (message: string) => {
    toast.error(message);
  };

  const info = (message: string) => {
    toast.info(message);
  };

  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    if (errorMessage.includes('Unauthorized')) {
      error(t('errors.unauthorized'));
    } else if (errorMessage.includes('not found')) {
      error(t('errors.notFound'));
    } else {
      error(errorMessage);
    }
  };

  return { success, error, info, handleError };
}
