import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task } from '../backend';

export function useExportTaskData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['exportTaskData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportTaskData();
    },
    enabled: false,
  });
}
