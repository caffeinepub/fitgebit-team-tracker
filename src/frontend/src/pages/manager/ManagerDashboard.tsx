import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManagerOvertimePage from './ManagerOvertimePage';
import ManagerStatsPage from './ManagerStatsPage';

export default function ManagerDashboard() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('managerSection.title')}
      </h2>

      <Tabs defaultValue="overtime" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overtime">{t('managerSection.overtime')}</TabsTrigger>
          <TabsTrigger value="stats">{t('managerSection.stats')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overtime" className="mt-6">
          <ManagerOvertimePage />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <ManagerStatsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
