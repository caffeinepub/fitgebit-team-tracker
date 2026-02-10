import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useCompleteTask } from '../../hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import type { Task } from '../../backend';
import { ExternalBlob } from '../../backend';

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task;
}

export default function CompleteTaskDialog({ open, onClose, task }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { mutateAsync: completeTask, isPending } = useCompleteTask();

  const [comment, setComment] = useState('');
  const [beforePhotoFile, setBeforePhotoFile] = useState<File | null>(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try {
      let beforePhoto: ExternalBlob | null = null;
      let afterPhoto: ExternalBlob | null = null;

      if (beforePhotoFile) {
        const bytes = new Uint8Array(await beforePhotoFile.arrayBuffer());
        beforePhoto = ExternalBlob.fromBytes(bytes);
      }

      if (afterPhotoFile) {
        const bytes = new Uint8Array(await afterPhotoFile.arrayBuffer());
        afterPhoto = ExternalBlob.fromBytes(bytes);
      }

      await completeTask({
        taskId: task.id,
        comment: comment.trim() || null,
        beforePhoto,
        afterPhoto,
      });
      success(t('common.success'));
      onClose();
      setComment('');
      setBeforePhotoFile(null);
      setAfterPhotoFile(null);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{t('tasks.markDone')}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{task.title}</p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">{t('tasks.completionComment')}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('tasks.completionComment')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beforePhoto" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {t('tasks.beforePhoto')}
            </Label>
            <Input
              id="beforePhoto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setBeforePhotoFile(e.target.files?.[0] || null)}
            />
            {beforePhotoFile && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {beforePhotoFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="afterPhoto" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {t('tasks.afterPhoto')}
            </Label>
            <Input
              id="afterPhoto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setAfterPhotoFile(e.target.files?.[0] || null)}
            />
            {afterPhotoFile && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {afterPhotoFile.name}
              </p>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? t('common.loading') : t('tasks.complete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
