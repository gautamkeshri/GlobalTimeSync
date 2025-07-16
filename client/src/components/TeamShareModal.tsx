import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2 } from "lucide-react";

interface TeamShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamShareModal({ open, onOpenChange }: TeamShareModalProps) {
  const [teamName, setTeamName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: (name: string) => apiRequest("POST", "/api/teams", { name }),
    onSuccess: async (response) => {
      const team = await response.json();
      const url = `${window.location.origin}/shared/${team.shareId}`;
      setShareUrl(url);
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }
    createTeamMutation.mutate(teamName);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTeamName("");
    setShareUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Timezone Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Create a team to share your timezone configuration with others.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with your team members to let them view your timezone setup.
              </p>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {shareUrl ? "Close" : "Cancel"}
          </Button>
          {!shareUrl && (
            <Button 
              onClick={handleCreateTeam}
              disabled={createTeamMutation.isPending}
            >
              Create Team
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
