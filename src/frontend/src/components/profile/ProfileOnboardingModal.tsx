import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useSaveCallerUserProfile } from '../../hooks/useUserProfile';
import { useGetCallerUserRole } from '../../hooks/useAuthz';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AvatarPicker from '../avatars/AvatarPicker';
import type { UserProfile } from '../../backend';
import { ProfileRole } from '../../backend';

export default function ProfileOnboardingModal() {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();

  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);

  const handleSave = async () => {
    if (!username.trim() || !initials.trim()) {
      handleError(new Error(t('errors.required')));
      return;
    }

    try {
      const profile: UserProfile = {
        username: username.trim(),
        avatar: selectedAvatar,
        role: userRole === 'admin' ? ProfileRole.manager : ProfileRole.assistant,
      };
      await saveProfile(profile);
      success(t('common.success'));
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('profile.setup')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">{t('profile.setupMessage')}</p>
          
          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('profile.username')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initials">{t('profile.initials')}</Label>
            <Input
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              placeholder={t('profile.initials')}
              maxLength={3}
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
            disabled={isPending || !username.trim() || !initials.trim()}
            className="w-full"
          >
            {isPending ? t('common.loading') : t('profile.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
