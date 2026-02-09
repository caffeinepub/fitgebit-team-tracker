export interface AvatarInfo {
  id: number;
  path: string;
  isIslamic?: boolean;
}

export const avatarManifest: AvatarInfo[] = [
  { id: 1, path: '/assets/generated/avatar-01.dim_256x256.svg' },
  { id: 2, path: '/assets/generated/avatar-02.dim_256x256.svg' },
  { id: 3, path: '/assets/generated/avatar-03.dim_256x256.svg' },
  { id: 4, path: '/assets/generated/avatar-04.dim_256x256.svg' },
  { id: 5, path: '/assets/generated/avatar-05.dim_256x256.svg' },
  { id: 6, path: '/assets/generated/avatar-06.dim_256x256.svg' },
  { id: 7, path: '/assets/generated/avatar-07.dim_256x256.svg' },
  { id: 8, path: '/assets/generated/avatar-08.dim_256x256.svg' },
  { id: 9, path: '/assets/generated/avatar-09.dim_256x256.svg' },
  { id: 10, path: '/assets/generated/avatar-10.dim_256x256.svg' },
  { id: 11, path: '/assets/generated/avatar-11.dim_256x256.svg' },
  { id: 12, path: '/assets/generated/avatar-12.dim_256x256.svg', isIslamic: true },
  { id: 13, path: '/assets/generated/avatar-13.dim_256x256.svg' },
  { id: 14, path: '/assets/generated/avatar-14.dim_256x256.svg' },
  { id: 15, path: '/assets/generated/avatar-15.dim_256x256.svg' },
  { id: 16, path: '/assets/generated/avatar-16.dim_256x256.svg' },
  { id: 17, path: '/assets/generated/avatar-17.dim_256x256.svg' },
  { id: 18, path: '/assets/generated/avatar-18.dim_256x256.svg' },
  { id: 19, path: '/assets/generated/avatar-19.dim_256x256.svg' },
  { id: 20, path: '/assets/generated/avatar-20.dim_256x256.svg' },
  { id: 21, path: '/assets/generated/avatar-21.dim_256x256.svg' },
  { id: 22, path: '/assets/generated/avatar-22.dim_256x256.svg' },
  { id: 23, path: '/assets/generated/avatar-23.dim_256x256.svg' },
  { id: 24, path: '/assets/generated/avatar-24.dim_256x256.svg', isIslamic: true },
  { id: 25, path: '/assets/generated/avatar-25.dim_256x256.svg' },
  { id: 26, path: '/assets/generated/avatar-26.dim_256x256.svg' },
  { id: 27, path: '/assets/generated/avatar-27.dim_256x256.svg' },
  { id: 28, path: '/assets/generated/avatar-28.dim_256x256.svg' },
  { id: 29, path: '/assets/generated/avatar-29.dim_256x256.svg' },
  { id: 30, path: '/assets/generated/avatar-30.dim_256x256.svg' },
  { id: 31, path: '/assets/generated/avatar-31.dim_256x256.svg' },
  { id: 32, path: '/assets/generated/avatar-32.dim_256x256.svg' },
  { id: 33, path: '/assets/generated/avatar-33.dim_256x256.svg' },
  { id: 34, path: '/assets/generated/avatar-34.dim_256x256.svg' },
  { id: 35, path: '/assets/generated/avatar-35.dim_256x256.svg' },
  { id: 36, path: '/assets/generated/avatar-36.dim_256x256.svg', isIslamic: true },
  { id: 37, path: '/assets/generated/avatar-37.dim_256x256.svg' },
  { id: 38, path: '/assets/generated/avatar-38.dim_256x256.svg' },
  { id: 39, path: '/assets/generated/avatar-39.dim_256x256.svg' },
  { id: 40, path: '/assets/generated/avatar-40.dim_256x256.svg' },
  { id: 41, path: '/assets/generated/avatar-41.dim_256x256.svg' },
  { id: 42, path: '/assets/generated/avatar-42.dim_256x256.svg' },
  { id: 43, path: '/assets/generated/avatar-43.dim_256x256.svg' },
  { id: 44, path: '/assets/generated/avatar-44.dim_256x256.svg' },
  { id: 45, path: '/assets/generated/avatar-45.dim_256x256.svg' },
  { id: 46, path: '/assets/generated/avatar-46.dim_256x256.svg' },
  { id: 47, path: '/assets/generated/avatar-47.dim_256x256.svg' },
  { id: 48, path: '/assets/generated/avatar-48.dim_256x256.svg', isIslamic: true },
];

export function getAvatarPath(id: number): string {
  const avatar = avatarManifest.find(a => a.id === id);
  return avatar?.path || avatarManifest[0].path;
}
