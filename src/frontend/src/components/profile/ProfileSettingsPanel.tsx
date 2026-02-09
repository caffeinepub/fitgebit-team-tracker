import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useUserProfile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AvatarPicker from '../avatars/AvatarPicker';
import PrivacyPanel from './PrivacyPanel';
import type { UserProfile } from '../../backend';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileSettingsPanel({ open, onClose }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { data: currentProfile } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setUsername(currentProfile.username);
      setInitials(''); // Initials not stored separately in backend
      setSelectedAvatar(currentProfile.avatar);
    }
  }, [currentProfile]);

  const handleSave = async () => {
    if (!username.trim() || !currentProfile) return;

    try {
      const profile: UserProfile = {
        username: username.trim(),
        avatar: selectedAvatar,
        role: currentProfile.role,
      };
      await saveProfile(profile);
      success(t('common.success'));
      onClose();
    } catch (error) {
      handleError(error);
    }
  };

  if (showPrivacy) {
    return <PrivacyPanel open={open} onClose={() => setShowPrivacy(false)} onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('profile.settings')}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('profile.avatar')}</Label>
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending || !username.trim()}
            className="w-full"
          >
            {isPending ? t('common.loading') : t('common.save')}
          </Button>

          <Separator />

          <Button
            variant="outline"
            onClick={() => setShowPrivacy(true)}
            className="w-full"
          >
            {t('privacy.title')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
