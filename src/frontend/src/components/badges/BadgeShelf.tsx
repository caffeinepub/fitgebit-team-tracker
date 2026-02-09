import { useI18n } from '../../hooks/useI18n';
import { useBadges } from '../../hooks/useBadges';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BadgeShelf({ open, onClose }: Props) {
  const { t } = useI18n();
  const { earnedBadges, allBadges } = useBadges();

  const isEarned = (badgeId: string) => earnedBadges.some(b => b.id === badgeId);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('badges.title')}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {allBadges.map((badge) => {
            const earned = isEarned(badge.id);
            return (
              <div
                key={badge.id}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${earned 
                    ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                    : 'border-gray-200 dark:border-gray-700 opacity-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{t(badge.nameKey)}</h3>
                      {earned && (
                        <Badge variant="secondary" className="text-xs">
                          {t('badges.earned')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(badge.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
