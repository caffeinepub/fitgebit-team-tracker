import { useGetDentalAvatars } from '../../hooks/useDentalAvatars';
import { useI18n } from '../../hooks/useI18n';
import DentalAvatarImage from './DentalAvatarImage';

interface Props {
  selectedAvatar: number;
  onSelectAvatar: (id: number) => void;
}

export default function AvatarPicker({ selectedAvatar, onSelectAvatar }: Props) {
  const { data: avatars, isLoading } = useGetDentalAvatars();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!avatars || avatars.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('avatars.noAvatarsAvailable')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelectAvatar(avatar.id)}
          className={`
            relative aspect-square rounded-xl overflow-hidden border-2 transition-all
            hover:scale-105 hover:shadow-lg
            ${selectedAvatar === avatar.id 
              ? 'border-teal-500 ring-2 ring-teal-300 dark:ring-teal-700' 
              : 'border-gray-200 dark:border-gray-700'
            }
          `}
          title={avatar.name}
        >
          <DentalAvatarImage
            avatarId={avatar.id}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
