import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useGetAllUserProfiles } from '../../hooks/useUserProfile';
import { useGetUserOvertimeEntries, prepareOvertimeExportData } from '../../hooks/useManagerOvertime';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import UserPicker from '../../components/manager/UserPicker';
import OvertimeHistory from '../../components/overtime/OvertimeHistory';
import OvertimeTotals from '../../components/overtime/OvertimeTotals';
import { exportToCSV } from '../../utils/csv';

export default function ManagerOvertimePage() {
  const { t } = useI18n();
  const { success, handleError } = useNotify();
  const { data: allProfiles = [] } = useGetAllUserProfiles();
  const [selectedUserId, setSelectedUserId] = useState<Principal | null>(null);
  
  const { data: userEntries = [], isLoading } = useGetUserOvertimeEntries(selectedUserId);

  const handleExport = async () => {
    try {
      if (!selectedUserId) {
        handleError(new Error(t('managerSection.selectUser')));
        return;
      }

      if (userEntries.length === 0) {
        handleError(new Error(t('managerSection.noData')));
        return;
      }

      const exportData = prepareOvertimeExportData(userEntries);
      const selectedProfile = allProfiles.find(([id]) => id.toString() === selectedUserId.toString());
      const username = selectedProfile?.[1]?.username || 'user';
      
      exportToCSV(exportData, `overtime-${username}-${new Date().toISOString().split('T')[0]}.csv`);
      success(t('overtime.exportSuccess'));
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <UserPicker
          users={allProfiles}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
        <Button 
          onClick={handleExport} 
          variant="outline" 
          className="gap-2"
          disabled={!selectedUserId || userEntries.length === 0}
        >
          <Download className="w-4 h-4" />
          {t('managerSection.exportCSV')}
        </Button>
      </div>

      {selectedUserId ? (
        isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            <OvertimeTotals entries={userEntries} />
            <OvertimeHistory entries={userEntries} />
          </>
        )
      ) : (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          {t('managerSection.selectUser')}
        </div>
      )}
    </div>
  );
}
