import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { OvertimeEntry } from '../backend';

export function useGetOvertimeEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OvertimeEntry[]>({
    queryKey: ['overtimeEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerOvertimeEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOvertimeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (minutes: number) => {
      if (!actor) throw new Error('Actor not available');
      // Backend expects bigint for minutes
      return actor.createOvertimeEntry(BigInt(minutes));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeEntries'] });
    },
  });
}
