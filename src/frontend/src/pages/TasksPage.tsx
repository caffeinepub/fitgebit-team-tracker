import { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useGetTasks, useResetRecurringTasks } from '../hooks/useTasks';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { ProfileRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import CreateTaskDialog from '../components/tasks/CreateTaskDialog';

export default function TasksPage() {
  const { t } = useI18n();
  const { data: tasks = [], isLoading, isFetched } = useGetTasks();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutateAsync: resetRecurringTasks } = useResetRecurringTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [resetChecked, setResetChecked] = useState(false);

  // Determine if user can reset tasks (all users can reset)
  const canResetTasks = !!userProfile;

  // Only trigger reset if we detect that a reset boundary might have been crossed
  // This prevents unnecessary resets on every page load
  useEffect(() => {
    if (isFetched && !resetChecked && tasks.length > 0) {
      setResetChecked(true);
      
      // Check if any task has a nextResetTimestamp that has passed
      const now = BigInt(Date.now() * 1_000_000); // Convert to nanoseconds as BigInt
      const shouldCheckReset = tasks.some((task) => {
        // If task has nextResetTimestamp and it's in the past, we should check
        if (task.nextResetTimestamp) {
          return task.nextResetTimestamp <= now;
        }
        // If no nextResetTimestamp, check based on lastResetAt and task type
        const lastReset = task.lastResetAt;
        const daysSinceReset = Number((now - lastReset) / BigInt(24 * 3600 * 1_000_000_000));
        
        if (task.taskType === 'weekly' && daysSinceReset >= 7) {
          return true;
        }
        if (task.taskType === 'monthly' && daysSinceReset >= 28) {
          return true;
        }
        return false;
      });

      // Only call reset if we detected a potential boundary crossing
      if (shouldCheckReset) {
        resetRecurringTasks().catch((error) => {
          console.error('Failed to reset recurring tasks:', error);
          // Don't show error to user - this is a background check
        });
      }
    }
  }, [isFetched, resetChecked, resetRecurringTasks, tasks]);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('tasks.title')}
        </h2>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('tasks.createTask')}
        </Button>
      </div>

      <TaskList tasks={tasks} canResetTasks={canResetTasks} />

      <CreateTaskDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
