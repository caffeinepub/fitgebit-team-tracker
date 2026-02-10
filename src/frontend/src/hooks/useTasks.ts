import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task, TaskType } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      taskType,
    }: {
      title: string;
      description: string;
      taskType: TaskType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createTask(title, description, taskType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      comment,
      beforePhoto,
      afterPhoto,
    }: {
      taskId: number;
      comment: string | null;
      beforePhoto: ExternalBlob | null;
      afterPhoto: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.completeTask(taskId, comment, beforePhoto, afterPhoto);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Handle obsolete weekly task error with automatic reset and retry
        if (errorMessage.includes('obsolete') && errorMessage.includes('weekly')) {
          // Reset recurring tasks and retry completion
          await actor.resetRecurringTasksIfNeeded();
          await actor.completeTask(taskId, comment, beforePhoto, afterPhoto);
        } else {
          throw error;
        }
      }
    },
    onMutate: async ({ taskId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistically update to move completed task down
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], (old) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === taskId
              ? { ...task, isCompleted: true }
              : task
          );
        });
      }

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSuccess: () => {
      // Invalidate to get the actual completion data from backend
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useResetTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useResetRecurringTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetRecurringTasksIfNeeded();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
