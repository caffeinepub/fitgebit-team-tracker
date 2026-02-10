import { useLookupAvatar } from '../../hooks/useDentalAvatars';

interface Props {
  avatarId: number;
  alt?: string;
  className?: string;
}

export default function DentalAvatarImage({ avatarId, alt = 'Avatar', className = '' }: Props) {
  const avatar = useLookupAvatar(avatarId);

  if (!avatar) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-xs">?</span>
      </div>
    );
  }

  // Convert SVG string to data URI for reliable rendering
  const svgDataUri = `data:image/svg+xml;base64,${btoa(avatar.svg)}`;

  return (
    <img
      src={svgDataUri}
      alt={alt}
      title={avatar.name}
      className={className}
    />
  );
}
