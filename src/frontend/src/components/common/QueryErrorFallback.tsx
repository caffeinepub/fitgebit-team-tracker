import { useI18n } from '../../hooks/useI18n';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: Error | null;
  onRetry: () => void;
  message?: string;
}

export default function QueryErrorFallback({ error, onRetry, message }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {message || t('common.error')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={onRetry} className="w-full">
          {t('common.retry')}
        </Button>
      </div>
    </div>
  );
}
