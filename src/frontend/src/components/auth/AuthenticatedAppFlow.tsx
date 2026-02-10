import { useGetCallerUserRole } from '../../hooks/useAuthz';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { UserRole } from '../../backend';
import RoleChoiceScreen from './RoleChoiceScreen';
import ProfileOnboardingModal from '../profile/ProfileOnboardingModal';
import AppShell from '../layout/AppShell';
import QueryErrorFallback from '../common/QueryErrorFallback';

export default function AuthenticatedAppFlow() {
  const {
    data: userRole,
    isLoading: roleLoading,
    isError: roleError,
    error: roleErrorObj,
    refetch: refetchRole,
  } = useGetCallerUserRole();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  // Handle role query error
  if (roleError) {
    return (
      <QueryErrorFallback
        error={roleErrorObj}
        onRetry={refetchRole}
        message="Failed to load user role"
      />
    );
  }

  // Handle profile query error (only if we're past role selection)
  if (userRole && userRole !== UserRole.guest && profileError) {
    return (
      <QueryErrorFallback
        error={profileErrorObj}
        onRetry={refetchProfile}
        message="Failed to load user profile"
      />
    );
  }

  // Loading state
  if (roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // State 1: User is guest → show role choice
  if (userRole === UserRole.guest) {
    return <RoleChoiceScreen />;
  }

  // State 2: User has role but no profile → show onboarding
  // Only show onboarding if profile query has completed (isFetched) and returned null
  // At this point, userRole is guaranteed to be admin or user (not guest)
  if (userRole && profileFetched && userProfile === null) {
    return <ProfileOnboardingModal />;
  }

  // State 3: User has role and profile (or profile still loading) → show app
  // We allow the app to render even if profile is still loading to avoid blank screen
  return <AppShell />;
}
