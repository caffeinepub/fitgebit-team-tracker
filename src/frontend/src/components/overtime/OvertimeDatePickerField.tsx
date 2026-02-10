import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface OvertimeDatePickerFieldProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  disabled?: boolean;
}

export default function OvertimeDatePickerField({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  disabled,
}: OvertimeDatePickerFieldProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Calculate min and max dates (today - 2 months to today)
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const minDate = twoMonthsAgo.toISOString().split('T')[0];

  // Convert current DD/MM/YYYY to YYYY-MM-DD for the native picker
  const currentDateValue = (() => {
    const dayNum = parseInt(day) || 1;
    const monthNum = parseInt(month) || 1;
    const yearNum = parseInt(year) || today.getFullYear();
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.toISOString().split('T')[0];
  })();

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value; // YYYY-MM-DD format
    if (selectedDate) {
      const [yearStr, monthStr, dayStr] = selectedDate.split('-');
      onDayChange(dayStr.padStart(2, '0'));
      onMonthChange(monthStr.padStart(2, '0'));
      onYearChange(yearStr);
    }
  };

  const handleContainerClick = () => {
    if (!disabled && dateInputRef.current) {
      dateInputRef.current.showPicker?.();
    }
  };

  return (
    <div className="relative">
      <div 
        className="grid grid-cols-3 gap-2 cursor-pointer"
        onClick={handleContainerClick}
      >
        <Input
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          placeholder="DD"
          disabled={disabled}
          className="cursor-pointer"
        />
        <Input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          placeholder="MM"
          disabled={disabled}
          className="cursor-pointer"
        />
        <Input
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          placeholder="YYYY"
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
      
      {/* Hidden native date picker */}
      <input
        ref={dateInputRef}
        type="date"
        value={currentDateValue}
        min={minDate}
        max={maxDate}
        onChange={handleDatePickerChange}
        disabled={disabled}
        className="absolute opacity-0 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Calendar icon indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <Calendar className="w-4 h-4" />
      </div>
    </div>
  );
}
