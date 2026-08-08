import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { getMedia } from "@/lib/actions/media";
import { UploadArea } from "./upload-area";
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
import { Copy } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Media | YRRG CMS",
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function MediaPage() {
  const session = await auth();
  requireCan(session, "read", "media");

  const { items } = await getMedia({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Library</h1>
      </div>

      <UploadArea />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card">
            No media found. Upload something above.
          </div>
        ) : (
          items.map((file) => {
            const isImage = file.mimeType.startsWith("image/");
            return (
              <div key={file.id} className="group relative rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {isImage ? (
                    <Image
                      src={file.url}
                      alt={file.alt || file.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="text-sm font-medium text-muted-foreground break-all px-2 text-center">
                      {file.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                    </div>
                  )}
                </div>
                <div className="p-2.5 text-xs border-t border-border bg-card space-y-1">
                  <p className="truncate font-bold text-foreground" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {formatBytes(file.size)}
                  </p>
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open URL"
                    className="size-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                  >
                    <Copy className="size-3.5" />
                  </a>
                  <DeleteMediaButton mediaId={file.id} filename={file.filename} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
