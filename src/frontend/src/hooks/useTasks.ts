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
      taskType,
    }: {
      title: string;
      taskType: TaskType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createTask(title, taskType);
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
      await actor.completeTask(taskId, comment, beforePhoto, afterPhoto);
    },
    onSuccess: () => {
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
