import { useLookupAvatar } from '../../hooks/useDentalAvatars';

interface Props {
  avatarId: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function DentalAvatarImage({ avatarId, alt = 'Avatar', className = '', style }: Props) {
  const avatar = useLookupAvatar(avatarId);

  if (!avatar) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-full ${className}`}
        style={style}
      >
        <span className="text-gray-400 text-xs">?</span>
      </div>
    );
  }

  // Use URL-safe encoding for SVG to avoid btoa() unicode issues
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatar.svg)}`;

  return <img src={svgDataUri} alt={alt} title={avatar.name} className={className} style={style} />;
}
