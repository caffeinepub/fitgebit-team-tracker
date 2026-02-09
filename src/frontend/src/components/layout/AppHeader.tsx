import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../hooks/useI18n';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut, Award, Sparkles } from 'lucide-react';
import { getAvatarPath } from '../avatars/avatarManifest';
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
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSelector />
              
              {profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                      <img
                        src={getAvatarPath(profile.avatar)}
                        alt={profile.username}
                        className="w-8 h-8 rounded-full border-2 border-teal-400"
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
