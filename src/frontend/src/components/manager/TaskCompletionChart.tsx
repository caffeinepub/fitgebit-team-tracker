import { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Principal } from '@dfinity/principal';
import type { Task, UserProfile } from '../../backend';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  tasks: Task[];
  profiles: Array<[Principal, UserProfile]>;
}

export default function TaskCompletionChart({ tasks, profiles }: Props) {
  const { t } = useI18n();

  const chartData = useMemo(() => {
    const completionsByUser = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.isCompleted && task.currentCompletion) {
        const userId = task.currentCompletion.completedBy.toString();
        completionsByUser.set(userId, (completionsByUser.get(userId) || 0) + 1);
      }
    });

    return profiles.map(([principal, profile]) => ({
      name: profile.username,
      completions: completionsByUser.get(principal.toString()) || 0,
    }));
  }, [tasks, profiles]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">{t('tasks.completed')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completions" fill="oklch(0.646 0.222 41.116)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
