"use client";

import { useState } from "react";
import { Campaign } from "@/lib/db/schema";
import { generateCampaignContentAction } from "@/lib/actions/marketing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, Newspaper, Zap, Wand2 } from "lucide-react";
import { sileo } from "sileo";

interface CMSItem {
  id: string;
  title: string;
}

interface CampaignGeneratorModalProps {
  postsList: CMSItem[];
  pagesList: CMSItem[];
  servicesList: CMSItem[];
  onGenerated?: (newCampaign?: Campaign) => void;
}

export function CampaignGeneratorModal({
  postsList,
  pagesList,
  servicesList,
  onGenerated,
}: CampaignGeneratorModalProps) {
  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"post" | "page" | "service" | "custom">("post");
  const [sourceId, setSourceId] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getSourceItems = () => {
    if (sourceType === "post") return postsList;
    if (sourceType === "page") return pagesList;
    if (sourceType === "service") return servicesList;
    return [];
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await generateCampaignContentAction({
      sourceType,
      sourceId: sourceType !== "custom" ? sourceId : undefined,
      customPrompt: customPrompt.trim() || undefined,
    });

    setLoading(false);

    if (res.success && res.campaign) {
      setOpen(false);
      if (onGenerated) onGenerated(res.campaign);
      sileo.success({
        title: "Campaign Generated!",
        description: "AI Agent created email newsletter and social media posts successfully.",
      });
    } else {
      sileo.error({
        title: "Generation Error",
        description: res.error || "Failed to generate AI campaign content.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="font-semibold gap-2 bg-gradient-to-r from-primary to-sky-600 text-white shadow-md hover:opacity-95">
            <Sparkles className="size-4" /> Generate Campaign with AI
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Wand2 className="size-5 text-primary" /> AI Marketing Campaign Agent
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4 pt-2">
          {/* Source Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Source Content Type</label>
            <Select
              value={sourceType}
              onValueChange={(val) => {
                setSourceType(val as "post" | "page" | "service" | "custom");
                setSourceId("");
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">
                  <span className="flex items-center gap-2"><Newspaper className="size-3.5" /> Blog Post</span>
                </SelectItem>
                <SelectItem value="page">
                  <span className="flex items-center gap-2"><FileText className="size-3.5" /> Page</span>
                </SelectItem>
                <SelectItem value="service">
                  <span className="flex items-center gap-2"><Zap className="size-3.5" /> Service / Plan</span>
                </SelectItem>
                <SelectItem value="custom">
                  <span className="flex items-center gap-2"><Sparkles className="size-3.5" /> Custom Topic</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Item Selector */}
          {sourceType !== "custom" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select {sourceType.toUpperCase()} Item</label>
              <Select value={sourceId} onValueChange={(val) => setSourceId(val || "")}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={`Select a ${sourceType}...`} />
                </SelectTrigger>
                <SelectContent>
                  {getSourceItems().map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Prompt / Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">
              {sourceType === "custom" ? "Describe Marketing Topic *" : "Additional AI Instructions (Optional)"}
            </label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={
                sourceType === "custom"
                  ? "e.g. Announce our new summer discount of 20% on all mindfulness services..."
                  : "e.g. Focus on an energetic tone, highlight limited availability..."
              }
              rows={3}
              required={sourceType === "custom"}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>Generating with AI...</>
              ) : (
                <>
                  <Wand2 className="size-4" /> Generate Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
