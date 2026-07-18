import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { getMedia, deleteMedia } from "@/lib/actions/media";
import { UploadArea } from "./upload-area";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import Image from "next/image";
import { revalidatePath } from "next/cache";

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

  // Allow deleting from server action
  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteMedia(id);
      revalidatePath("/media");
    }
  }

  const { items } = await getMedia({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
      </div>

      <UploadArea />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No media found. Upload something above.
          </div>
        ) : (
          items.map((file) => {
            const isImage = file.mimeType.startsWith("image/");
            return (
              <div key={file.id} className="group relative rounded-md border bg-card overflow-hidden flex flex-col">
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
                <div className="p-2 text-xs border-t bg-card space-y-1">
                  <p className="truncate font-medium" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 hover:bg-background" > */}
                    <a href={file.url} target="_blank" rel="noreferrer" title="Open URL" className="h-7 w-7 bg-background/80 hover:bg-background flex items-center justify-center rounded-md">
                      <Copy className="h-3.5 w-3.5" />
                    </a>
                  {/* </Button> */}
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={file.id} />
                    <Button variant="destructive" size="icon" type="submit" className="h-7 w-7 bg-destructive/90 hover:bg-destructive rounded-full" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" style={{color: "white"}}/>
                    </Button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
