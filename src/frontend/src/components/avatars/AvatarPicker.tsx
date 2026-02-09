import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { avatarManifest } from './avatarManifest';

interface Props {
  selectedAvatar: number;
  onSelectAvatar: (id: number) => void;
}

const AVATARS_PER_PAGE = 8;

export default function AvatarPicker({ selectedAvatar, onSelectAvatar }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(avatarManifest.length / AVATARS_PER_PAGE);
  const startIdx = page * AVATARS_PER_PAGE;
  const endIdx = startIdx + AVATARS_PER_PAGE;
  const currentAvatars = avatarManifest.slice(startIdx, endIdx);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {currentAvatars.map((avatar) => (
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
          >
            <img
              src={avatar.path}
              alt={`Avatar ${avatar.id}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
