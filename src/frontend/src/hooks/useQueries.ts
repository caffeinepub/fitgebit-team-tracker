import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

// This file is intentionally minimal as feature-specific hooks are in separate files
// (useUserProfile.ts, useAuthz.ts, useOvertime.ts, useTasks.ts, useManagerTasks.ts, useManagerOvertime.ts)
