import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useIsCallerAdmin } from '../../hooks/useAuthz';
import AppHeader from './AppHeader';
import TabNav from '../navigation/TabNav';
import TasksPage from '../../pages/TasksPage';
import OvertimePage from '../../pages/OvertimePage';
import ManagerDashboard from '../../pages/manager/ManagerDashboard';

type Tab = 'tasks' | 'overtime' | 'manager';

export default function AppShell() {
  const { t } = useI18n();
  const { data: isAdmin } = useIsCallerAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const tabs = [
    { id: 'tasks' as Tab, label: t('nav.tasks') },
    { id: 'overtime' as Tab, label: t('nav.overtime') },
    ...(isAdmin ? [{ id: 'manager' as Tab, label: t('nav.manager') }] : []),
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as Tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="mt-6">
          {activeTab === 'tasks' && <TasksPage />}
          {activeTab === 'overtime' && <OvertimePage />}
          {activeTab === 'manager' && isAdmin && <ManagerDashboard />}
        </div>
      </div>
      <footer className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
