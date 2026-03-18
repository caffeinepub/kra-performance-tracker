import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface KRAEntry {
    id: bigint;
    period: string;
    selfRating?: Rating;
    createdAt: Time;
    createdBy: Principal;
    particulars: string;
    hodRating?: Rating;
}
export type Time = bigint;
export type Rating = number;
export interface PeriodSummary {
    totalEntries: bigint;
    period: string;
    averageHODRating?: number;
    averageSelfRating?: number;
}
export interface UserProfile {
    name: string;
    employeeId?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createKRAEntry(period: string, particulars: string): Promise<bigint>;
    deleteKRAEntry(id: bigint): Promise<void>;
    getAllKRAEntries(): Promise<Array<KRAEntry>>;
    getAllSummaries(): Promise<Array<PeriodSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKRAEntriesByPeriod(period: string): Promise<Array<KRAEntry>>;
    getKRAEntry(id: bigint): Promise<KRAEntry | null>;
    getMyKRAEntries(): Promise<Array<KRAEntry>>;
    getSummaryByPeriod(period: string): Promise<PeriodSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitHODRating(id: bigint, rating: Rating): Promise<void>;
    submitSelfRating(id: bigint, rating: Rating): Promise<void>;
    updateKRAEntry(id: bigint, period: string, particulars: string): Promise<void>;
}
