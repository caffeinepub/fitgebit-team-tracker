import { useI18n } from '../hooks/useI18n';
import { useGetOvertimeEntries } from '../hooks/useOvertime';
import OvertimeForm from '../components/overtime/OvertimeForm';
import OvertimeHistory from '../components/overtime/OvertimeHistory';
import OvertimeTotals from '../components/overtime/OvertimeTotals';

export default function OvertimePage() {
  const { t } = useI18n();
  const { data: entries = [], isLoading } = useGetOvertimeEntries();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('overtime.title')}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <OvertimeForm />
        <OvertimeTotals entries={entries} />
      </div>

      <OvertimeHistory entries={entries} />
    </div>
  );
}
