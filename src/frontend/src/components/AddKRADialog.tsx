import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { KRAEntry } from "../backend.d";

interface AddKRADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (period: string, particulars: string) => Promise<void>;
  editEntry?: KRAEntry | null;
  isPending?: boolean;
}

export function AddKRADialog({
  open,
  onOpenChange,
  onSubmit,
  editEntry,
  isPending,
}: AddKRADialogProps) {
  const [period, setPeriod] = useState("daily");
  const [particulars, setParticulars] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: open intentionally resets form
  useEffect(() => {
    if (editEntry) {
      setPeriod(editEntry.period);
      setParticulars(editEntry.particulars);
    } else {
      setPeriod("daily");
      setParticulars("");
    }
  }, [editEntry, open]);

  const handleSubmit = async () => {
    if (!particulars.trim()) return;
    await onSubmit(period, particulars.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="kra.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editEntry ? "Edit KRA Entry" : "Add KRA Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="period-select">Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger
                id="period-select"
                data-ocid="kra.period.select"
                className="w-full"
              >
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="particulars-input">Particulars</Label>
            <Textarea
              id="particulars-input"
              data-ocid="kra.particulars.textarea"
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              placeholder="Describe the KRA objective..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            data-ocid="kra.cancel.button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="kra.submit.button"
            onClick={handleSubmit}
            disabled={!particulars.trim() || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editEntry ? "Save Changes" : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
