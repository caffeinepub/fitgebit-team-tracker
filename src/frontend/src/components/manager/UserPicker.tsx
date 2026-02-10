import { Principal } from '@dfinity/principal';
import { useI18n } from '../../hooks/useI18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserProfile } from '../../backend';
import ProfileAvatar from '../avatars/ProfileAvatar';

interface Props {
  users: Array<[Principal, UserProfile]>;
  selectedUserId: Principal | null;
  onSelectUser: (userId: Principal | null) => void;
}

export default function UserPicker({ users, selectedUserId, onSelectUser }: Props) {
  const { t } = useI18n();

  return (
    <Select
      value={selectedUserId?.toString() || ''}
      onValueChange={(value) => {
        if (value) {
          onSelectUser(Principal.fromText(value));
        } else {
          onSelectUser(null);
        }
      }}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder={t('managerSection.selectUser')} />
      </SelectTrigger>
      <SelectContent>
        {users.map(([principal, profile]) => (
          <SelectItem key={principal.toString()} value={principal.toString()}>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                profilePhoto={profile.profilePhoto}
                dentalAvatarId={profile.avatar}
                initials={profile.initials}
                username={profile.username}
                size={24}
              />
              <span>{profile.username}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
