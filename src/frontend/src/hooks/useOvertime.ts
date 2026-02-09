import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Overtime has been removed from the backend
// These hooks are kept for backwards compatibility but will return empty data

export function useGetOvertimeEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['overtimeEntries'],
    queryFn: async () => {
      // Overtime removed from backend - return empty array
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOvertimeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Overtime removed from backend - no-op
      throw new Error('Overtime functionality has been removed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeEntries'] });
    },
  });
}
