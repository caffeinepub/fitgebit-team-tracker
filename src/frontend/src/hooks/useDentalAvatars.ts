import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DentalAvatar } from '../backend';

export function useGetDentalAvatars() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DentalAvatar[]>({
    queryKey: ['dentalAvatars'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const avatars = await actor.getAllDentalAvatars();

      // If we get an empty or incomplete set, throw an error to trigger error state
      if (avatars.length === 0) {
        throw new Error('No avatars available. Please initialize the avatar set.');
      }

      if (avatars.length !== 16) {
        console.warn(`Expected 16 avatars, got ${avatars.length}`);
      }

      return avatars;
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity, // Avatars don't change
    retry: 1,
  });
}

export function useInitializeAvatars() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.initializeAvatars();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentalAvatars'] });
    },
  });
}

export function useLookupAvatar(avatarId: number) {
  const { data: avatars } = useGetDentalAvatars();
  return avatars?.find((a) => a.id === avatarId);
}
