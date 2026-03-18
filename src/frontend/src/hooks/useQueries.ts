import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  KRAEntry,
  PeriodSummary,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useAllKRAEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<KRAEntry[]>({
    queryKey: ["kraEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKRAEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyKRAEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<KRAEntry[]>({
    queryKey: ["myKraEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyKRAEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSummaries() {
  const { actor, isFetching } = useActor();
  return useQuery<PeriodSummary[]>({
    queryKey: ["allSummaries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSummaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateKRA() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      period,
      particulars,
    }: { period: string; particulars: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createKRAEntry(period, particulars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myKraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allSummaries"] });
    },
  });
}

export function useUpdateKRA() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      period,
      particulars,
    }: { id: bigint; period: string; particulars: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateKRAEntry(id, period, particulars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myKraEntries"] });
    },
  });
}

export function useDeleteKRA() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteKRAEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myKraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allSummaries"] });
    },
  });
}

export function useSubmitSelfRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rating }: { id: bigint; rating: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitSelfRating(id, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myKraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allSummaries"] });
    },
  });
}

export function useSubmitHODRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rating }: { id: bigint; rating: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitHODRating(id, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myKraEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allSummaries"] });
    },
  });
}
