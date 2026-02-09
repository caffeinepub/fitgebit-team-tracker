import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useGetTasks } from '../../hooks/useTasks';
import { useGetAllUserProfiles } from '../../hooks/useUserProfile';
import { useActor } from '../../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import TaskCompletionChart from '../../components/manager/TaskCompletionChart';
import TaskAuditLog from '../../components/manager/TaskAuditLog';
import { exportToCSV } from '../../utils/csv';

export default function ManagerStatsPage() {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { actor } = useActor();
  const { data: tasks = [] } = useGetTasks();
  const { data: allProfiles = [] } = useGetAllUserProfiles();

  const handleExport = async () => {
    try {
      if (!actor) throw new Error('Actor not available');
      const data = await actor.exportTaskData();

      const rows = data.map((task) => ({
        id: task.id,
        title: task.title,
        taskType: task.taskType,
        isCompleted: task.isCompleted,
        completedBy: task.currentCompletion?.completedBy.toString() || '',
        completedAt: task.currentCompletion 
          ? new Date(Number(task.currentCompletion.completedAt) / 1000000).toISOString()
          : '',
        comment: task.currentCompletion?.comment || '',
        hasBeforePhoto: task.currentCompletion?.beforePhoto ? 'Yes' : 'No',
        hasAfterPhoto: task.currentCompletion?.afterPhoto ? 'Yes' : 'No',
        lastResetAt: new Date(Number(task.lastResetAt) / 1000000).toISOString(),
      }));

      exportToCSV(rows, 'tasks-export.csv');
      success(t('common.success'));
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{t('managerSection.stats')}</h3>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('managerSection.exportCSV')}
        </Button>
      </div>

      <TaskCompletionChart tasks={tasks} profiles={allProfiles} />
      <TaskAuditLog tasks={tasks} profiles={allProfiles} />
    </div>
  );
}
