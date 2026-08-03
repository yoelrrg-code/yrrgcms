"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, Trash2, Edit, Layers, Video, FileText, Globe, UploadCloud, Loader2 } from "lucide-react";
import { addModule, deleteModule, addLesson, updateLesson, deleteLesson, updateCourseLevel } from "@/lib/actions/courses";
import { courseLevelEnum, lessonContentTypeEnum } from "@/lib/db/schema";
import { sileo } from "sileo";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";

type CourseLevel = (typeof courseLevelEnum.enumValues)[number];
type ContentType = (typeof lessonContentTypeEnum.enumValues)[number];

type LessonType = {
  id: string;
  title: string;
  contentType: ContentType;
  contentUrl: string;
  duration: string | null;
  isFreePreview: boolean;
};

type CourseWithDetails = {
  courseId: string;
  productId: string;
  productTitle: string;
  level: CourseLevel;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<LessonType>;
  }>;
};

export default function CourseEditor({ course }: { course: CourseWithDetails }) {
  const [modules, setModules] = useState(course.modules);
  const [level, setLevel] = useState<CourseLevel>(course.level);

  // Module Modal state
  const [isModOpen, setIsModOpen] = useState(false);
  const [modTitle, setModTitle] = useState("");

  // Lesson Modal state
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonType | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lessonData, setLessonData] = useState<{
    title: string;
    contentType: ContentType;
    contentUrl: string;
    duration: string;
    isFreePreview: boolean;
  }>({
    title: "",
    contentType: "VIDEO",
    contentUrl: "",
    duration: "",
    isFreePreview: false,
  });

  const handleOpenAddLesson = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setEditingLesson(null);
    setLessonData({
      title: "",
      contentType: "VIDEO",
      contentUrl: "",
      duration: "",
      isFreePreview: false,
    });
    setIsLessonOpen(true);
  };

  const handleOpenEditLesson = (moduleId: string, lesson: LessonType) => {
    setActiveModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonData({
      title: lesson.title,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl,
      duration: lesson.duration || "",
      isFreePreview: lesson.isFreePreview,
    });
    setIsLessonOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();
      const fileUrl = data.media?.url || data.url;

      setLessonData((prev) => ({
        ...prev,
        contentUrl: fileUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));

      sileo.success({ title: "Document uploaded successfully!" });
    } catch (err: unknown) {
      sileo.error({ title: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLevelChange = async (newLevel: CourseLevel) => {
    setLevel(newLevel);
    await updateCourseLevel(course.courseId, newLevel);
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMod = await addModule(course.courseId, modTitle, modules.length);
    if (newMod) {
      setModules((prev) => [...prev, { ...newMod, lessons: [] }]);
    }
    setModTitle("");
    setIsModOpen(false);
  };

  const handleDeleteModule = (modId: string, title: string) => {
    sileo.action({
      title: "Delete Module?",
      description: `Delete "${title}" and all of its lessons?`,
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          try {
            await deleteModule(modId);
            setModules((prev) => prev.filter((m) => m.id !== modId));
            sileo.success({ title: "Module Deleted", description: "Module and its lessons were removed." });
          } catch (err) {
            sileo.error({ title: "Delete Failed", description: err instanceof Error ? err.message : "Error deleting module." });
          }
        },
      },
    });
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleId) return;

    if (editingLesson) {
      const updated = await updateLesson(editingLesson.id, lessonData);
      if (updated) {
        setModules((prev) =>
          prev.map((m) => {
            if (m.id === activeModuleId) {
              return {
                ...m,
                lessons: m.lessons.map((l) => (l.id === editingLesson.id ? updated : l)),
              };
            }
            return m;
          })
        );
      }
    } else {
      const newLesson = await addLesson({
        moduleId: activeModuleId,
        ...lessonData,
      });

      if (newLesson) {
        setModules((prev) =>
          prev.map((m) => {
            if (m.id === activeModuleId) {
              return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
          })
        );
      }
    }

    setLessonData({
      title: "",
      contentType: "VIDEO",
      contentUrl: "",
      duration: "",
      isFreePreview: false,
    });
    setEditingLesson(null);
    setIsLessonOpen(false);
  };

  const handleDeleteLesson = (modId: string, lessonId: string, title: string) => {
    sileo.action({
      title: "Delete Lesson?",
      description: `Are you sure you want to delete lesson "${title}"?`,
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          try {
            await deleteLesson(lessonId);
            setModules((prev) =>
              prev.map((m) => {
                if (m.id === modId) {
                  return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
                }
                return m;
              })
            );
            sileo.success({ title: "Lesson Deleted" });
          } catch (err) {
            sileo.error({ title: "Delete Failed", description: err instanceof Error ? err.message : "Error deleting lesson." });
          }
        },
      },
    });
  };

  return (
    <div className="rounded-md border border-border bg-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{course.productTitle}</h2>
          <p className="text-xs text-muted-foreground">Curriculum & LMS Content Configuration</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-muted-foreground">Level:</label>
          <select
            value={level}
            onChange={(e) => handleLevelChange(e.target.value as CourseLevel)}
            className="h-9 px-3 border border-input rounded-md text-xs bg-background font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <Dialog open={isModOpen} onOpenChange={setIsModOpen}>
            <Button size="sm" className="gap-1.5" nativeButton render={<DialogTrigger />}>
              <PlusIcon className="h-4 w-4" /> Add Module
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Module</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddModule} className="space-y-4 py-2">
                <Input
                  required
                  placeholder="Module Title (e.g. Module 1: Introduction)"
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Create Module
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modules list */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-md">
            <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">This course does not have any modules yet.</p>
          </div>
        ) : (
          modules.map((mod, idx) => (
            <div key={mod.id} className="border border-border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    Module {idx + 1}
                  </Badge>
                  <h3 className="font-semibold text-sm">{mod.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAddLesson(mod.id)}
                    className="h-8 text-xs gap-1"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> Lesson
                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => handleDeleteModule(mod.id, mod.title)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Lessons inside module */}
              <div className="p-3 divide-y divide-border">
                {mod.lessons.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic px-2 py-1">No lessons added to this module.</p>
                ) : (
                  mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="py-2 px-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {lesson.contentType === "VIDEO" ? (
                          <Video className="h-4 w-4 text-sky-500" />
                        ) : lesson.contentType === "WEBINAR_LINK" ? (
                          <Globe className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-medium">{lesson.title}</span>
                        {lesson.isFreePreview && (
                          <Badge variant="secondary" className="text-[10px] py-0">
                            Free Preview
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        {lesson.duration && <span className="mr-1">{lesson.duration}</span>}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditLesson(mod.id, lesson)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(mod.id, lesson.id, lesson.title)}
                          className="h-7 w-7 p-0 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for adding/editing lesson */}
      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLesson} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Lesson Title</label>
              <Input
                required
                placeholder="e.g. Lesson 1: Key Concepts"
                value={lessonData.title}
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Content Type</label>
                <select
                  className="w-full h-10 px-3 border border-input rounded-md text-xs bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={lessonData.contentType}
                  onChange={(e) => setLessonData({ ...lessonData, contentType: e.target.value as ContentType })}
                >
                  <option value="VIDEO">Video (Vimeo/YouTube/Blob)</option>
                  <option value="WEBINAR_LINK">Webinar / Zoom Link</option>
                  <option value="PDF_DOCUMENT">Document / PDF</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Duration (e.g. 15 min)</label>
                <Input
                  placeholder="15 min"
                  value={lessonData.duration}
                  onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
                />
              </div>
            </div>

            {lessonData.contentType === "PDF_DOCUMENT" && (
              <div className="space-y-2 p-3 bg-muted/30 border border-border rounded-md">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Upload Document / PDF
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2 text-xs"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>

                  <MediaPicker
                    onSelect={(url) => setLessonData((prev) => ({ ...prev, contentUrl: url }))}
                    trigger={
                      <Button type="button" variant="secondary" className="text-xs">
                        Select from Media
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Content / File URL</label>
              <Input
                required
                placeholder={
                  lessonData.contentType === "PDF_DOCUMENT"
                    ? "Upload file above or paste document URL"
                    : "https://vimeo.com/... or Video URL"
                }
                value={lessonData.contentUrl}
                onChange={(e) => setLessonData({ ...lessonData, contentUrl: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="freePreview"
                checked={lessonData.isFreePreview}
                onChange={(e) => setLessonData({ ...lessonData, isFreePreview: e.target.checked })}
              />
              <label htmlFor="freePreview" className="text-xs text-muted-foreground">
                Allow as free preview (watchable before purchase)
              </label>
            </div>

            <Button type="submit" className="w-full">
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
