import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useCreateTask } from '../../hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType } from '../../backend';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskDialog({ open, onClose }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { mutateAsync: createTask, isPending } = useCreateTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(TaskType.weekly);

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
      await createTask({
        title: title.trim(),
        description: description.trim(),
        taskType,
      });
      success(t('common.success'));
      onClose();
      setTitle('');
      setDescription('');
      setTaskType(TaskType.weekly);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{t('tasks.createTask')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('tasks.taskTitle')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tasks.taskTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('tasks.description')}</Label>
            <Textarea
              id="description"
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
            {isPending ? t('common.loading') : t('common.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
