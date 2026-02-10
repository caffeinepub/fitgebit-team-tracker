import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { OvertimeEntry } from '../backend';
import type { Principal } from '@dfinity/principal';

export function useGetUserOvertimeEntries(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OvertimeEntry[]>({
    queryKey: ['userOvertimeEntries', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) throw new Error('Actor or user not available');
      return actor.getUserOvertimeEntries(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function prepareOvertimeExportData(entries: OvertimeEntry[]) {
  return entries.map((entry) => {
    const date = new Date(Number(entry.date) / 1000000);
    const minutes = Number(entry.minutes);
    const isAddition = minutes > 0;
    
    return {
      Date: date.toLocaleDateString(),
      Type: isAddition ? 'Add' : 'Deduct',
      Minutes: Math.abs(minutes),
      Approved: entry.approved ? 'Yes' : 'No',
      CreatedBy: entry.createdBy.toString(),
    };
  });
}
