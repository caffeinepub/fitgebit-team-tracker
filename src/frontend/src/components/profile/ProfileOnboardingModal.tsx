import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useSaveCallerUserProfile, useUploadProfilePhoto } from '../../hooks/useUserProfile';
import { useGetCallerUserRole } from '../../hooks/useAuthz';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarPicker from '../avatars/AvatarPicker';
import ProfilePhotoField from './ProfilePhotoField';
import GeneratedDentalAvatar from '../avatars/GeneratedDentalAvatar';
import type { UserProfile } from '../../backend';
import { ProfileRole, ExternalBlob } from '../../backend';

type AvatarMode = 'dental' | 'photo' | 'generated';

export default function ProfileOnboardingModal() {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { mutateAsync: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();
  const { mutateAsync: uploadPhoto, isPending: isUploading } = useUploadProfilePhoto();
  const { data: userRole } = useGetCallerUserRole();

  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('dental');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const initialsError = initials.length > 0 && (initials.length < 2 || initials.length > 3);
  const canSave =
    username.trim().length > 0 &&
    initials.length >= 2 &&
    initials.length <= 3 &&
    (avatarMode === 'dental' || avatarMode === 'generated' || (avatarMode === 'photo' && photoFile !== null));

  const handleSave = async () => {
    if (!canSave) {
      handleError(new Error(t('errors.required')));
      return;
    }

    try {
      let profilePhotoBlob: ExternalBlob | undefined = undefined;

      // Upload photo if photo mode is selected
      if (avatarMode === 'photo' && photoFile) {
        const arrayBuffer = await photoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        await uploadPhoto(blob);
        profilePhotoBlob = blob;
      }

      const profile: UserProfile = {
        username: username.trim(),
        initials: initials.trim().toUpperCase(),
        avatar: selectedAvatar,
        profilePhoto: profilePhotoBlob,
        role: userRole === 'admin' ? ProfileRole.manager : ProfileRole.assistant,
      };

      await saveProfile(profile);
      success(t('common.success'));
    } catch (error) {
      handleError(error);
    }
  };

  const isPending = isSaving || isUploading;

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
              placeholder={t('profile.initialsPlaceholder')}
              maxLength={3}
            />
            {initialsError && <p className="text-sm text-destructive">{t('errors.initialsLength')}</p>}
            <p className="text-xs text-muted-foreground">{t('profile.initialsHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.avatarChoice')}</Label>
            <Tabs value={avatarMode} onValueChange={(v) => setAvatarMode(v as AvatarMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dental">{t('profile.dentalAvatar')}</TabsTrigger>
                <TabsTrigger value="photo">{t('profile.uploadPhoto')}</TabsTrigger>
                <TabsTrigger value="generated">{t('profile.generatedAvatar')}</TabsTrigger>
              </TabsList>

              <TabsContent value="dental" className="mt-4">
                <AvatarPicker selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
              </TabsContent>

              <TabsContent value="photo" className="mt-4">
                <ProfilePhotoField
                  photoFile={photoFile}
                  onPhotoChange={setPhotoFile}
                  uploadProgress={uploadProgress}
                />
              </TabsContent>

              <TabsContent value="generated" className="mt-4">
                <div className="flex flex-col items-center gap-4">
                  <GeneratedDentalAvatar initials={initials || 'AB'} size={120} />
                  <p className="text-sm text-muted-foreground text-center">{t('profile.generatedAvatarHint')}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleSave} disabled={isPending || !canSave} className="w-full">
            {isPending ? `${t('common.loading')} ${uploadProgress > 0 ? `${uploadProgress}%` : ''}` : t('profile.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
