import { useRef } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  photoFile: File | null;
  onPhotoChange: (file: File | null) => void;
  uploadProgress?: number;
}

export default function ProfilePhotoField({ photoFile, onPhotoChange, uploadProgress = 0 }: Props) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('errors.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('errors.fileTooLarge'));
      return;
    }

    onPhotoChange(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {photoFile ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(photoFile)}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-teal-400"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />

        <Label htmlFor="photo-upload">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} type="button">
            {photoFile ? t('profile.changePhoto') : t('profile.selectPhoto')}
          </Button>
        </Label>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground mt-1">
              {t('profile.uploading')} {uploadProgress}%
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">{t('profile.photoHint')}</p>
      </div>
    </div>
  );
}
