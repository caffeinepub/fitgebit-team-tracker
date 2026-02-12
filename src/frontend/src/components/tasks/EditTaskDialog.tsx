import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useEditTask } from '../../hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType, type Task } from '../../backend';

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task;
}

export default function EditTaskDialog({ open, onClose, task }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { mutateAsync: editTask, isPending } = useEditTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(TaskType.weekly);

  // Pre-fill form when dialog opens or task changes
  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description);
      setTaskType(task.taskType);
    }
  }, [open, task]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      handleError(new Error(t('errors.required')));
      return;
    }

    if (!description.trim()) {
      handleError(new Error(t('tasks.descriptionRequired')));
      return;
    }

    try {
      await editTask({
        taskId: task.id,
        title: title.trim(),
        description: description.trim(),
        taskType,
      });
      success(t('tasks.taskUpdated'));
      onClose();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{t('tasks.editTask')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('tasks.taskTitle')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tasks.taskTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('tasks.description')}</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('tasks.descriptionPlaceholder')}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{t('tasks.descriptionHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('tasks.type')}</Label>
            <Select
              value={taskType}
              onValueChange={(value) => setTaskType(value as TaskType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskType.weekly}>{t('tasks.weekly')}</SelectItem>
                <SelectItem value={TaskType.monthly}>{t('tasks.monthly')}</SelectItem>
                <SelectItem value={TaskType.urgent}>{t('tasks.urgent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? t('common.loading') : t('tasks.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
