import { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useGetTasks, useResetRecurringTasks } from '../hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import CreateTaskDialog from '../components/tasks/CreateTaskDialog';

export default function TasksPage() {
  const { t } = useI18n();
  const { data: tasks = [], isLoading } = useGetTasks();
  const { mutateAsync: resetRecurringTasks } = useResetRecurringTasks();
  const [showCreate, setShowCreate] = useState(false);

  // Reset recurring tasks when the page mounts (app opens)
  useEffect(() => {
    resetRecurringTasks().catch((error) => {
      console.error('Failed to reset recurring tasks:', error);
    });
  }, [resetRecurringTasks]);

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

      <TaskList tasks={tasks} />

      <CreateTaskDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
