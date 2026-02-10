import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DentalAvatar } from '../backend';

export function useGetDentalAvatars() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DentalAvatar[]>({
    queryKey: ['dentalAvatars'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const avatars = await actor.getAllDentalAvatars();

      // Backend should always return 16 avatars
      if (avatars.length === 0) {
        console.warn('No avatars returned from backend, using empty array');
        return [];
      }

      if (avatars.length !== 16) {
        console.warn(`Expected 16 avatars, got ${avatars.length}`);
      }

      return avatars;
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity, // Avatars don't change
    retry: 2,
  });
}

export function useLookupAvatar(avatarId: number) {
  const { data: avatars } = useGetDentalAvatars();
  return avatars?.find((a) => a.id === avatarId);
}
