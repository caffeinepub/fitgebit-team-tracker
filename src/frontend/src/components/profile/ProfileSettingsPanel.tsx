import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useUploadProfilePhoto,
  useRemoveProfilePhoto,
} from '../../hooks/useUserProfile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarPicker from '../avatars/AvatarPicker';
import ProfilePhotoField from './ProfilePhotoField';
import PrivacyPanel from './PrivacyPanel';
import ProfileAvatar from '../avatars/ProfileAvatar';
import type { UserProfile } from '../../backend';
import { ExternalBlob } from '../../backend';

interface Props {
  open: boolean;
  onClose: () => void;
}

type AvatarMode = 'dental' | 'photo';

export default function ProfileSettingsPanel({ open, onClose }: Props) {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { data: currentProfile } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();
  const { mutateAsync: uploadPhoto, isPending: isUploading } = useUploadProfilePhoto();
  const { mutateAsync: removePhoto, isPending: isRemoving } = useRemoveProfilePhoto();

  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('dental');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setUsername(currentProfile.username);
      setInitials(currentProfile.initials || '');
      setSelectedAvatar(currentProfile.avatar);
      setAvatarMode(currentProfile.profilePhoto ? 'photo' : 'dental');
    }
  }, [currentProfile]);

  const initialsError = initials.length > 0 && (initials.length < 2 || initials.length > 3);
  const canSave = username.trim().length > 0 && initials.length >= 2 && initials.length <= 3;

  const handleRemovePhoto = async () => {
    try {
      await removePhoto();
      setPhotoFile(null);
      setAvatarMode('dental');
      success(t('profile.photoRemoved'));
    } catch (error) {
      handleError(error);
    }
  };

  const handleSave = async () => {
    if (!canSave || !currentProfile) return;

    try {
      let profilePhotoBlob: ExternalBlob | undefined = currentProfile.profilePhoto;

      // Upload new photo if selected
      if (avatarMode === 'photo' && photoFile) {
        const arrayBuffer = await photoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        await uploadPhoto(blob);
        profilePhotoBlob = blob;
      }

      // Remove photo if switching to dental avatar
      if (avatarMode === 'dental' && currentProfile.profilePhoto) {
        await removePhoto();
        profilePhotoBlob = undefined;
      }

      const profile: UserProfile = {
        username: username.trim(),
        initials: initials.trim().toUpperCase(),
        avatar: selectedAvatar,
        profilePhoto: profilePhotoBlob,
        role: currentProfile.role,
      };

      await saveProfile(profile);
      success(t('common.success'));
      onClose();
    } catch (error) {
      handleError(error);
    }
  };

  const isPending = isSaving || isUploading || isRemoving;

  if (showPrivacy) {
    return <PrivacyPanel open={open} onClose={() => setShowPrivacy(false)} onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto bg-white dark:bg-gray-950 backdrop-blur-none">
        <SheetHeader>
          <SheetTitle>{t('profile.settings')}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <ProfileAvatar
              profilePhoto={currentProfile?.profilePhoto}
              dentalAvatarId={currentProfile?.avatar}
              initials={initials || currentProfile?.initials || 'AB'}
              username={currentProfile?.username}
              size={80}
              className="border-4 border-teal-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dental">{t('profile.dentalAvatar')}</TabsTrigger>
                <TabsTrigger value="photo">{t('profile.uploadPhoto')}</TabsTrigger>
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
                {currentProfile?.profilePhoto && !photoFile && (
                  <div className="mt-4 text-center">
                    <Button variant="destructive" size="sm" onClick={handleRemovePhoto} disabled={isPending}>
                      {t('profile.removePhoto')}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleSave} disabled={isPending || !canSave} className="w-full">
            {isPending
              ? `${t('common.loading')} ${uploadProgress > 0 ? `${uploadProgress}%` : ''}`
              : t('common.save')}
          </Button>

          <Separator />

          <Button variant="outline" onClick={() => setShowPrivacy(true)} className="w-full">
            {t('privacy.title')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
