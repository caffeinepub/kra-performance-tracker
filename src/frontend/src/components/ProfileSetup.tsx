import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export function ProfileSetup() {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        employeeId: employeeId.trim() || undefined,
      });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-card">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={22} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-lg">Welcome to KRAFlow</CardTitle>
          <CardDescription className="text-sm">
            Set up your profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-input">Full Name *</Label>
              <Input
                id="name-input"
                data-ocid="profile.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-id-input">Employee ID (optional)</Label>
              <Input
                id="employee-id-input"
                data-ocid="profile.employee_id.input"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-001"
              />
            </div>
            <Button
              data-ocid="profile.submit.button"
              type="submit"
              className="w-full"
              disabled={!name.trim() || saveProfile.isPending}
            >
              {saveProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
