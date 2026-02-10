import { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OvertimeEntry } from '../../backend';

interface Props {
  entries: OvertimeEntry[];
}

function formatCompositeTime(totalMinutes: number): string {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  
  // 8 hours = 1 day, 60 minutes = 1 hour
  const days = Math.floor(absMinutes / 480);
  const remainingAfterDays = absMinutes % 480;
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  const result = parts.join(', ');
  return isNegative ? `-${result}` : result;
}

export default function OvertimeTotals({ entries }: Props) {
  const { t } = useI18n();

  const { totalMinutes, compositeDisplay } = useMemo(() => {
    // Backend stores signed minutes: positive = add, negative = deduct
    const total = entries.reduce((sum, entry) => {
      return sum + Number(entry.minutes);
    }, 0);

    return {
      totalMinutes: total,
      compositeDisplay: formatCompositeTime(total),
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
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="font-medium">{t('overtime.totalComposite')}</span>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {compositeDisplay}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
