"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions/blogActions";
import { safeAction } from "./safeAction";
import ConfirmDialog from "./ConfirmDialog";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Delete “${title}”`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-700">
        <Trash2 className="w-4 h-4" aria-hidden />
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this article?"
        confirmLabel="Delete article"
        danger
        busy={busy}
        onCancel={() => { setOpen(false); setError(""); }}
        onConfirm={async () => {
          setBusy(true);
          const res = await safeAction(deletePostAction(id));
          setBusy(false);
          if (!res.success) { setError(res.error); return; }
          setOpen(false);
          router.refresh();
        }}
      >
        <p>“{title}” will be permanently removed. Its tags, author and type are kept.</p>
        {error && <p role="alert" className="font-semibold text-red-700">{error}</p>}
      </ConfirmDialog>
    </>
  );
}
