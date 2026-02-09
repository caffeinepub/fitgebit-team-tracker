import { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Principal } from '@dfinity/principal';
import type { Task, UserProfile } from '../../backend';
import { TaskType } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Camera } from 'lucide-react';

interface Props {
  tasks: Task[];
  profiles: Array<[Principal, UserProfile]>;
}

export default function TaskAuditLog({ tasks, profiles }: Props) {
  const { t } = useI18n();

  const profileMap = useMemo(() => {
    return new Map(profiles.map(([p, profile]) => [p.toString(), profile]));
  }, [profiles]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.isCompleted && t.currentCompletion);
  }, [tasks]);

  const typeLabels = {
    [TaskType.weekly]: 'weekly',
    [TaskType.monthly]: 'monthly',
    [TaskType.urgent]: 'urgent',
  };

  if (completedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400">
          {t('managerSection.noData')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">{t('overtime.history')}</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('tasks.taskTitle')}</TableHead>
              <TableHead>{t('tasks.type')}</TableHead>
              <TableHead>{t('tasks.completedBy')}</TableHead>
              <TableHead>{t('tasks.completionComment')}</TableHead>
              <TableHead>{t('tasks.photos')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedTasks.map((task) => {
              const profile = task.currentCompletion 
                ? profileMap.get(task.currentCompletion.completedBy.toString())
                : null;
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{t(`tasks.${typeLabels[task.taskType]}`)}</TableCell>
                  <TableCell>{profile?.username || 'Unknown'}</TableCell>
                  <TableCell>{task.currentCompletion?.comment || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {task.currentCompletion?.beforePhoto && (
                        <div className="flex items-center gap-1 text-xs">
                          <Camera className="w-3 h-3 text-teal-500" />
                          <span>Before</span>
                        </div>
                      )}
                      {task.currentCompletion?.afterPhoto && (
                        <div className="flex items-center gap-1 text-xs">
                          <Camera className="w-3 h-3 text-teal-500" />
                          <span>After</span>
                        </div>
                      )}
                      {!task.currentCompletion?.beforePhoto && !task.currentCompletion?.afterPhoto && '-'}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
