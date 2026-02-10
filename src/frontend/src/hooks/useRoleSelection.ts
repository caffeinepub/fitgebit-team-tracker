import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useSelectRoleAssistant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.selectRoleAssistant();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

export function useSelectRoleManager() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.selectRoleManager(token);
      } catch (error: any) {
        // Normalize backend trap messages for UI display
        if (error.message && error.message.includes('Invalid token')) {
          throw new Error('Invalid manager token. Please check and try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
