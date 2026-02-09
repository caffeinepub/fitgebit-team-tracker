export interface Badge {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
}

export const badges: Badge[] = [
  {
    id: 'first-overtime',
    nameKey: 'badges.firstOvertime',
    descKey: 'badges.firstOvertimeDesc',
    icon: '⏰',
  },
  {
    id: 'overtime-veteran',
    nameKey: 'badges.overtimeVeteran',
    descKey: 'badges.overtimeVeteranDesc',
    icon: '🏆',
  },
  {
    id: 'first-task',
    nameKey: 'badges.firstTask',
    descKey: 'badges.firstTaskDesc',
    icon: '✅',
  },
  {
    id: 'task-master',
    nameKey: 'badges.taskMaster',
    descKey: 'badges.taskMasterDesc',
    icon: '🌟',
  },
  {
    id: 'task-legend',
    nameKey: 'badges.taskLegend',
    descKey: 'badges.taskLegendDesc',
    icon: '👑',
  },
];
