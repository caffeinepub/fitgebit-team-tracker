interface Props {
  initials: string;
  size?: number;
  className?: string;
}

const PASTEL_COLORS = [
  { bg: '#FFE5E5', text: '#FF6B6B' }, // Pastel pink
  { bg: '#E5F3FF', text: '#4A90E2' }, // Pastel blue
  { bg: '#E5FFE5', text: '#66BB6A' }, // Pastel mint
  { bg: '#FFF3E5', text: '#FFA726' }, // Pastel peach
  { bg: '#F3E5FF', text: '#AB47BC' }, // Pastel lavender
  { bg: '#E5FFFF', text: '#26C6DA' }, // Pastel cyan
  { bg: '#FFFFE5', text: '#D4AF37' }, // Pastel yellow
  { bg: '#FFE5F3', text: '#EC407A' }, // Pastel rose
];

export default function GeneratedDentalAvatar({ initials, size = 40, className = '' }: Props) {
  // Generate consistent color based on initials
  const colorIndex = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PASTEL_COLORS.length;
  const colors = PASTEL_COLORS[colorIndex];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ borderRadius: '50%' }}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill={colors.bg} />

      {/* Tooth shape */}
      <path
        d="M 50 25 Q 40 25 35 35 Q 30 45 30 55 Q 30 65 35 70 Q 40 75 50 75 Q 60 75 65 70 Q 70 65 70 55 Q 70 45 65 35 Q 60 25 50 25 Z"
        fill="white"
        opacity="0.3"
      />

      {/* Initials text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={size > 60 ? '32' : '28'}
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {initials.substring(0, 3).toUpperCase()}
      </text>
    </svg>
  );
}
