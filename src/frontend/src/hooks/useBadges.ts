import { useMemo } from 'react';
import { useGetOvertimeEntries } from './useOvertime';
import { useGetTasks } from './useTasks';
import { badges, type Badge } from '../components/badges/badges';

export function useBadges() {
  const { data: overtimeEntries = [] } = useGetOvertimeEntries();
  const { data: tasks = [] } = useGetTasks();

  const earnedBadges = useMemo(() => {
    const earned: Badge[] = [];

    // First overtime entry
    if (overtimeEntries.length >= 1) {
      const badge = badges.find(b => b.id === 'first-overtime');
      if (badge) earned.push(badge);
    }

    // 10 overtime entries
    if (overtimeEntries.length >= 10) {
      const badge = badges.find(b => b.id === 'overtime-veteran');
      if (badge) earned.push(badge);
    }

    // First task completion
    const completedTasks = tasks.filter(t => t.isCompleted);
    if (completedTasks.length >= 1) {
      const badge = badges.find(b => b.id === 'first-task');
      if (badge) earned.push(badge);
    }

    // 10 task completions
    if (completedTasks.length >= 10) {
      const badge = badges.find(b => b.id === 'task-master');
      if (badge) earned.push(badge);
    }

    // 50 task completions
    if (completedTasks.length >= 50) {
      const badge = badges.find(b => b.id === 'task-legend');
      if (badge) earned.push(badge);
    }

    return earned;
  }, [overtimeEntries, tasks]);

  return {
    earnedBadges,
    allBadges: badges,
  };
}
