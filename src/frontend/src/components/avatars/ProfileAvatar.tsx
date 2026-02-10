import { ExternalBlob } from '../../backend';
import DentalAvatarImage from './DentalAvatarImage';
import GeneratedDentalAvatar from './GeneratedDentalAvatar';

interface Props {
  profilePhoto?: ExternalBlob;
  dentalAvatarId?: number;
  initials?: string;
  username?: string;
  size?: number;
  className?: string;
}

export default function ProfileAvatar({
  profilePhoto,
  dentalAvatarId,
  initials = 'AB',
  username = 'User',
  size = 40,
  className = '',
}: Props) {
  // Priority 1: Uploaded photo
  if (profilePhoto) {
    return (
      <img
        src={profilePhoto.getDirectURL()}
        alt={username}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Priority 2: Dental SVG avatar
  if (dentalAvatarId !== undefined) {
    return (
      <DentalAvatarImage
        avatarId={dentalAvatarId}
        alt={username}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Priority 3: Generated avatar with initials
  return <GeneratedDentalAvatar initials={initials} size={size} className={className} />;
}
