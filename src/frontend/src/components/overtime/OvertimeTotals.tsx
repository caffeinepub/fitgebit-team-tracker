import { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OvertimeEntry {
  id: number;
  minutes: number;
  isAddition: boolean;
  timestamp: bigint;
  comment?: string;
}

interface Props {
  entries: OvertimeEntry[];
}

export default function OvertimeTotals({ entries }: Props) {
  const { t } = useI18n();

  const { totalMinutes, workdays, remainderMinutes } = useMemo(() => {
    const total = entries.reduce((sum, entry) => {
      return sum + (entry.isAddition ? entry.minutes : -entry.minutes);
    }, 0);

    const days = Math.floor(total / 480);
    const remainder = total % 480;

    return {
      totalMinutes: total,
      workdays: days,
      remainderMinutes: remainder,
    };
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overtime.totals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <span className="font-medium">{t('overtime.totalMinutes')}</span>
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {totalMinutes}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <span className="font-medium">{t('overtime.workdays')}</span>
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {workdays}
              {remainderMinutes !== 0 && (
                <span className="text-sm ml-2">
                  {remainderMinutes > 0 ? '+' : ''}{remainderMinutes}m
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
