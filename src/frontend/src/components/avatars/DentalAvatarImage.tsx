import { useState } from 'react';
import { useLookupAvatar } from '../../hooks/useDentalAvatars';

interface Props {
  avatarId: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

function isValidSVG(svg: string): boolean {
  // Check if SVG contains actual content beyond placeholder text
  if (!svg || svg.length < 20) return false;
  if (svg.includes('...') || !svg.includes('<svg')) return false;
  
  // Basic SVG structure validation
  const hasOpenTag = svg.includes('<svg');
  const hasCloseTag = svg.includes('</svg>');
  
  return hasOpenTag && hasCloseTag;
}

// Deterministic fallback SVG for missing/invalid avatars
function FallbackAvatar({ className, style, ariaLabel }: { className?: string; style?: React.CSSProperties; ariaLabel?: string }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label={ariaLabel}
    >
      <title>{ariaLabel || 'Avatar'}</title>
      <rect width="120" height="120" fill="#e0f7fa" />
      <ellipse cx="60" cy="70" rx="30" ry="24" fill="#fff" />
      <ellipse cx="55" cy="72" rx="7" ry="18" fill="#b2ebf2" />
      <ellipse cx="65" cy="72" rx="7" ry="18" fill="#b2ebf2" />
      <ellipse cx="60" cy="85" rx="12" ry="6" fill="#80deea" />
    </svg>
  );
}

export default function DentalAvatarImage({ avatarId, alt = 'Avatar', className = '', style }: Props) {
  const avatar = useLookupAvatar(avatarId);
  const [imageError, setImageError] = useState(false);

  // Show fallback if avatar is missing, invalid, or image failed to load
  if (!avatar || !isValidSVG(avatar.svg) || imageError) {
    return <FallbackAvatar className={className} style={style} ariaLabel={avatar?.name || 'Avatar'} />;
  }

  // Use URL-safe encoding for SVG to avoid btoa() unicode issues
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatar.svg)}`;

  return (
    <img 
      src={svgDataUri} 
      alt={alt} 
      title={avatar.name} 
      className={className} 
      style={style}
      onError={() => setImageError(true)}
    />
  );
}
