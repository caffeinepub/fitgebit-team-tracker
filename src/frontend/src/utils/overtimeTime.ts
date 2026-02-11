/**
 * Overtime time conversion utilities
 * Defines workday as 7 hours 30 minutes (450 minutes)
 */

export const MINUTES_PER_WORKDAY = 450; // 7h30
export const MINUTES_PER_HOUR = 60;

/**
 * Formats total minutes as composite time (days, hours, minutes)
 * using 450 minutes per workday and 60 minutes per hour
 */
export function formatCompositeTime(totalMinutes: number): string {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  
  // 450 minutes = 1 workday, 60 minutes = 1 hour
  const days = Math.floor(absMinutes / MINUTES_PER_WORKDAY);
  const remainingAfterDays = absMinutes % MINUTES_PER_WORKDAY;
  const hours = Math.floor(remainingAfterDays / MINUTES_PER_HOUR);
  const minutes = remainingAfterDays % MINUTES_PER_HOUR;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  const result = parts.join(', ');
  return isNegative ? `-${result}` : result;
}
