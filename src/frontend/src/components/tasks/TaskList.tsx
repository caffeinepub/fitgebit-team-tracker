import { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { Task } from '../../backend';
import { TaskType } from '../../backend';
import TaskCard from './TaskCard';

interface Props {
  tasks: Task[];
}

export default function TaskList({ tasks }: Props) {
  const { t } = useI18n();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Completed tasks go to bottom
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      // Sort by type priority: urgent > weekly > monthly
      const typePriority = {
        [TaskType.urgent]: 0,
        [TaskType.weekly]: 1,
        [TaskType.monthly]: 2,
      };
      
      return typePriority[a.taskType] - typePriority[b.taskType];
    });
  }, [tasks]);

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('tasks.noTasks')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{t('tasks.createFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
