import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import type { OvertimeEntry } from '../../backend';

interface Props {
  entries: OvertimeEntry[];
}

export default function OvertimeHistory({ entries }: Props) {
  const { t } = useI18n();

  const sortedEntries = [...entries].sort((a, b) => Number(b.date) - Number(a.date));

  if (sortedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('overtime.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            {t('overtime.noEntries')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overtime.history')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const date = new Date(Number(entry.date) / 1000000);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            // Backend stores signed minutes: positive = add, negative = deduct
            const minutes = Number(entry.minutes);
            const isAddition = minutes > 0;
            const absMinutes = Math.abs(minutes);
            
            return (
              <div
                key={entry.id}
                className={`
                  p-4 rounded-lg border-2
                  ${isAddition 
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20' 
                    : 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isAddition ? (
                      <Plus className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <Minus className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                    <div>
                      <div className={`font-semibold ${isAddition ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isAddition ? '+' : '-'}{absMinutes} {t('overtime.minutes')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {day}/{month}/{year}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
