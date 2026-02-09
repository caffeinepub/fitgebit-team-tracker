import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNotify } from '../../hooks/useNotify';
import { useGetAllUserProfiles } from '../../hooks/useUserProfile';
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

  // Overtime functionality has been removed from backend
  const userEntries: any[] = [];

  const handleExport = async () => {
    try {
      // Backend overtime functionality removed - show error
      handleError(new Error('Overtime export functionality is currently unavailable'));
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
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('managerSection.exportCSV')}
        </Button>
      </div>

      {selectedUserId ? (
        <>
          <OvertimeTotals entries={userEntries} />
          <OvertimeHistory entries={userEntries} />
        </>
      ) : (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          {t('managerSection.selectUser')}
        </div>
      )}
    </div>
  );
}
