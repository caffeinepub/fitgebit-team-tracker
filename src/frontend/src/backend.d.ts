import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface TaskCompletion {
    completedAt: Time;
    completedBy: Principal;
    afterPhoto?: ExternalBlob;
    beforePhoto?: ExternalBlob;
    comment?: string;
}
export interface Task {
    id: number;
    title: string;
    lastResetAt: Time;
    isCompleted: boolean;
    taskType: TaskType;
    currentCompletion?: TaskCompletion;
}
export interface DecisionEntry {
    id: number;
    decision: DecisionType;
    repeatInterval: RepeatInterval;
    name: string;
    createdAt: Time;
    createdBy: Principal;
    lastUpdated: Time;
    completionFiles?: Array<ExternalBlob>;
    isDone: boolean;
    comment?: string;
    completionComment?: string;
    timestamp: Time;
    decisionFiles?: Array<ExternalBlob>;
    completionTimestamp?: Time;
}
export interface DentalAvatar {
    id: number;
    svg: string;
    name: string;
}
export interface UserProfile {
    username: string;
    role: ProfileRole;
    avatar: number;
}
export enum DecisionType {
    valid = "valid",
    invalid = "invalid",
    critical = "critical"
}
export enum ProfileRole {
    manager = "manager",
    assistant = "assistant"
}
export enum RepeatInterval {
    monthly = "monthly",
    daily = "daily",
    weekly = "weekly"
}
export enum TaskType {
    urgent = "urgent",
    monthly = "monthly",
    weekly = "weekly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: number, comment: string | null, beforePhoto: ExternalBlob | null, afterPhoto: ExternalBlob | null): Promise<void>;
    createTask(title: string, taskType: TaskType): Promise<void>;
    exportTaskData(): Promise<Array<Task>>;
    getAllDentalAvatars(): Promise<Array<DentalAvatar>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDecisionEntries(): Promise<Array<DecisionEntry>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAvatars(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    resetRecurringTasksIfNeeded(): Promise<void>;
    resetTask(taskId: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selectRoleAssistant(): Promise<void>;
    selectRoleManager(_token: string): Promise<void>;
}
