import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useResetTask } from '../../hooks/useTasks';
import { useNotify } from '../../hooks/useNotify';
import type { Task } from '../../backend';
import { TaskType } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Camera, RotateCcw } from 'lucide-react';
import CompleteTaskDialog from './CompleteTaskDialog';

interface Props {
  task: Task;
  canResetTasks?: boolean;
}

export default function TaskCard({ task, canResetTasks = false }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const [showComplete, setShowComplete] = useState(false);
  const { mutateAsync: resetTask, isPending: isResetting } = useResetTask();

  const completedByProfile = useGetUserProfile(task.currentCompletion?.completedBy || null);

  const typeColors = {
    [TaskType.weekly]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    [TaskType.monthly]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    [TaskType.urgent]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
  };

  const typeLabels = {
    [TaskType.weekly]: 'weekly',
    [TaskType.monthly]: 'monthly',
    [TaskType.urgent]: 'urgent',
  };

  const cardBorderClass = task.isCompleted 
    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
    : typeColors[task.taskType];

  const handleReset = async () => {
    try {
      await resetTask(task.id);
      success(t('common.success'));
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <Card className={`border-2 ${cardBorderClass}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {task.isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={typeColors[task.taskType]}>
                  {t(`tasks.${typeLabels[task.taskType]}`)}
                </Badge>
                {task.isCompleted && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {t('tasks.completed')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!task.isCompleted && (
                <Button onClick={() => setShowComplete(true)} size="sm">
                  {t('tasks.markDone')}
                </Button>
              )}
              {task.isCompleted && canResetTasks && (
                <Button 
                  onClick={handleReset} 
                  size="sm" 
                  variant="outline"
                  disabled={isResetting}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isResetting ? t('common.loading') : t('tasks.resetTask')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {task.isCompleted && task.currentCompletion && (
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">{t('tasks.completedBy')}:</span>
                <span>{completedByProfile.data?.username || 'Unknown'}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {new Date(Number(task.currentCompletion.completedAt) / 1000000).toLocaleString()}
              </div>
              {task.currentCompletion.comment && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm">{task.currentCompletion.comment}</p>
                </div>
              )}
              {(task.currentCompletion.beforePhoto || task.currentCompletion.afterPhoto) && (
                <div className="flex gap-2 mt-3">
                  {task.currentCompletion.beforePhoto && (
                    <div className="flex-1">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Before
                      </div>
                      <img
                        src={task.currentCompletion.beforePhoto.getDirectURL()}
                        alt="Before"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  {task.currentCompletion.afterPhoto && (
                    <div className="flex-1">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        After
                      </div>
                      <img
                        src={task.currentCompletion.afterPhoto.getDirectURL()}
                        alt="After"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <CompleteTaskDialog
        open={showComplete}
        onClose={() => setShowComplete(false)}
        task={task}
      />
    </>
  );
}
