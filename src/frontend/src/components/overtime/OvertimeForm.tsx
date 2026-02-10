import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useCreateOvertimeEntry } from '../../hooks/useOvertime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

export default function OvertimeForm() {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const createOvertimeMutation = useCreateOvertimeEntry();

  const [minutes, setMinutes] = useState('');
  const [day, setDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [comment, setComment] = useState('');

  const handleSubmit = async (isAddition: boolean) => {
    const minutesNum = parseInt(minutes);
    if (isNaN(minutesNum) || minutesNum <= 0) {
      handleError(new Error(t('errors.invalidMinutes')));
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31 || isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum)) {
      handleError(new Error(t('errors.invalidInput')));
      return;
    }

    const selectedDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      handleError(new Error(t('errors.futureDate')));
      return;
    }

    try {
      // Apply sign based on add/deduct
      const signedMinutes = isAddition ? minutesNum : -minutesNum;
      await createOvertimeMutation.mutateAsync(signedMinutes);
      success(t('overtime.entryCreated'));
      
      // Reset form
      setMinutes('');
      setComment('');
      // Reset date to today
      const now = new Date();
      setDay(now.getDate().toString().padStart(2, '0'));
      setMonth((now.getMonth() + 1).toString().padStart(2, '0'));
      setYear(now.getFullYear().toString());
    } catch (error) {
      handleError(error);
    }
  };

  const isPending = createOvertimeMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overtime.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="minutes">{t('overtime.minutes')}</Label>
          <Input
            id="minutes"
            type="number"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="0"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('overtime.date')}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="DD"
              disabled={isPending}
            />
            <Input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="MM"
              disabled={isPending}
            />
            <Input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="YYYY"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">{t('overtime.comment')}</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('overtime.comment')}
            rows={2}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isPending ? t('common.loading') : t('overtime.add')}
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Minus className="w-4 h-4 mr-2" />
            {isPending ? t('common.loading') : t('overtime.deduct')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
