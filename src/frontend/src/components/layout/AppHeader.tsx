import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../hooks/useI18n';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, Award } from 'lucide-react';
import ProfileAvatar from '../avatars/ProfileAvatar';
import ProfileSettingsPanel from '../profile/ProfileSettingsPanel';
import BadgeShelf from '../badges/BadgeShelf';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { ProfileRole } from '../../backend';

export default function AppHeader() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const [showSettings, setShowSettings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-teal-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10">
                <img
                  src="/assets/generated/app-logo-tooth.dim_256x256.png"
                  alt="Tooth Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSelector />

              {profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                      <ProfileAvatar
                        profilePhoto={profile.profilePhoto}
                        dentalAvatarId={profile.avatar}
                        initials={profile.initials}
                        username={profile.username}
                        size={32}
                        className="border-2 border-teal-400"
                      />
                      <div className="text-left hidden sm:block">
                        <div className="text-sm font-medium">{profile.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {profile.role === ProfileRole.manager ? t('profile.manager') : t('profile.assistant')}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowBadges(true)}>
                      <Award className="w-4 h-4 mr-2" />
                      {t('badges.title')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('profile.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProfileSettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
      <BadgeShelf open={showBadges} onClose={() => setShowBadges(false)} />
    </>
  );
}
