import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { KRAEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllKRAEntries,
  useCreateKRA,
  useDeleteKRA,
  useSubmitHODRating,
  useSubmitSelfRating,
  useUpdateKRA,
} from "../hooks/useQueries";
import { AddKRADialog } from "./AddKRADialog";
import { PeriodBadge } from "./PeriodBadge";
import { StarRating } from "./StarRating";

const PERIODS = ["all", "daily", "monthly", "quarterly"] as const;
type PeriodFilter = (typeof PERIODS)[number];

interface KRATableProps {
  isAdmin: boolean;
}

export function KRATable({ isAdmin }: KRATableProps) {
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal().toString();

  const { data: entries = [], isLoading } = useAllKRAEntries();
  const createKRA = useCreateKRA();
  const updateKRA = useUpdateKRA();
  const deleteKRA = useDeleteKRA();
  const submitSelfRating = useSubmitSelfRating();
  const submitHODRating = useSubmitHODRating();

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<KRAEntry | null>(null);
  const [pendingRating, setPendingRating] = useState<bigint | null>(null);

  const filtered =
    periodFilter === "all"
      ? entries
      : entries.filter((e) => e.period.toLowerCase() === periodFilter);

  const handleCreate = async (period: string, particulars: string) => {
    try {
      await createKRA.mutateAsync({ period, particulars });
      toast.success("KRA entry added successfully");
    } catch {
      toast.error("Failed to add KRA entry");
    }
  };

  const handleUpdate = async (period: string, particulars: string) => {
    if (!editEntry) return;
    try {
      await updateKRA.mutateAsync({ id: editEntry.id, period, particulars });
      toast.success("KRA entry updated");
      setEditEntry(null);
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteKRA.mutateAsync(id);
      toast.success("KRA entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const handleSelfRating = async (id: bigint, rating: number) => {
    setPendingRating(id);
    try {
      await submitSelfRating.mutateAsync({ id, rating });
      toast.success("Self rating submitted");
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setPendingRating(null);
    }
  };

  const handleHODRating = async (id: bigint, rating: number) => {
    setPendingRating(id);
    try {
      await submitHODRating.mutateAsync({ id, rating });
      toast.success("HOD rating submitted");
    } catch {
      toast.error("Failed to submit HOD rating");
    } finally {
      setPendingRating(null);
    }
  };

  const isOwner = (entry: KRAEntry) =>
    callerPrincipal != null && entry.createdBy.toString() === callerPrincipal;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-card-foreground">
            KRA Entries
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button
          data-ocid="kra.add.primary_button"
          size="sm"
          onClick={() => {
            setEditEntry(null);
            setDialogOpen(true);
          }}
          className="gap-1.5"
        >
          <Plus size={14} />
          Add KRA
        </Button>
      </div>

      {/* Period filter tabs */}
      <div className="px-5 pt-3">
        <Tabs
          value={periodFilter}
          onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}
        >
          <TabsList className="h-8">
            {PERIODS.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                data-ocid={`kra.${p}.tab`}
                className="text-xs capitalize h-7"
              >
                {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="mt-3">
        {isLoading ? (
          <div data-ocid="kra.loading_state" className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="kra.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <ClipboardList
              size={40}
              className="text-muted-foreground/30 mb-3"
            />
            <p className="text-sm font-medium text-muted-foreground">
              No KRA entries found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {periodFilter !== "all"
                ? `No ${periodFilter} entries yet.`
                : 'Click "Add KRA" to get started.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-xs font-semibold text-muted-foreground pl-5">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Particulars
                </TableHead>
                <TableHead className="w-28 text-xs font-semibold text-muted-foreground">
                  Period
                </TableHead>
                <TableHead className="w-36 text-xs font-semibold text-muted-foreground">
                  Self Rating
                </TableHead>
                <TableHead className="w-36 text-xs font-semibold text-muted-foreground">
                  HOD Rating
                </TableHead>
                <TableHead className="w-24 text-xs font-semibold text-muted-foreground text-right pr-5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry, idx) => {
                const owner = isOwner(entry);
                const itemNum = idx + 1;
                const isBusy = pendingRating === entry.id;
                return (
                  <TableRow
                    key={entry.id.toString()}
                    data-ocid={`kra.item.${itemNum}`}
                    className="group"
                  >
                    <TableCell className="text-xs text-muted-foreground pl-5">
                      {itemNum}
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-medium">
                      {entry.particulars}
                    </TableCell>
                    <TableCell>
                      <PeriodBadge period={entry.period} />
                    </TableCell>
                    <TableCell>
                      {owner && !entry.selfRating ? (
                        <div
                          className={
                            isBusy ? "opacity-50 pointer-events-none" : ""
                          }
                        >
                          <StarRating
                            value={0}
                            onChange={(r) => handleSelfRating(entry.id, r)}
                          />
                        </div>
                      ) : (
                        <StarRating value={entry.selfRating ?? 0} readonly />
                      )}
                    </TableCell>
                    <TableCell>
                      {isAdmin && !entry.hodRating ? (
                        <div
                          className={
                            isBusy ? "opacity-50 pointer-events-none" : ""
                          }
                        >
                          <StarRating
                            value={0}
                            onChange={(r) => handleHODRating(entry.id, r)}
                          />
                        </div>
                      ) : (
                        <StarRating value={entry.hodRating ?? 0} readonly />
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      {owner && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            data-ocid={`kra.edit_button.${itemNum}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditEntry(entry);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            data-ocid={`kra.delete_button.${itemNum}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AddKRADialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditEntry(null);
        }}
        onSubmit={editEntry ? handleUpdate : handleCreate}
        editEntry={editEntry}
        isPending={createKRA.isPending || updateKRA.isPending}
      />
    </div>
  );
}
