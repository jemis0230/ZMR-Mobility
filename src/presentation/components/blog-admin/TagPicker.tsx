"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createTagAction } from "@/app/actions/blogActions";
import { safeAction } from "./safeAction";
import { cleanName, nameKey, MAX_TAGS_PER_POST, TAG_NAME_MAX } from "@/lib/blog/text";

export type TagOption = { id: string; name: string; slug: string };

type Option = { kind: "tag"; tag: TagOption } | { kind: "create"; name: string };

/** Searchable multi-select with removable chips and inline tag creation (ARIA combobox). */
export default function TagPicker({
  tags, selected, onChange, onTagCreated, error,
}: {
  tags: TagOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onTagCreated: (tag: TagOption) => void;
  error?: string;
}) {
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // -1 = nothing highlighted until the user arrows into the list.
  const [active, setActive] = useState(-1);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState("");

  const byId = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const chosen = selected.map((id) => byId.get(id)).filter((t): t is TagOption => !!t);
  const full = selected.length >= MAX_TAGS_PER_POST;

  const q = cleanName(query);
  const exact = q ? tags.find((t) => nameKey(t.name) === nameKey(q)) : undefined;
  const options: Option[] = useMemo(() => {
    const matches = tags
      .filter((t) => !selected.includes(t.id) && (!q || t.name.toLowerCase().includes(q.toLowerCase())))
      .slice(0, 8)
      .map((tag) => ({ kind: "tag" as const, tag }));
    return q && !exact && q.length <= TAG_NAME_MAX ? [...matches, { kind: "create" as const, name: q }] : matches;
  }, [tags, selected, q, exact]);

  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;
  const showList = open && !full && options.length > 0;

  const add = (id: string) => {
    if (!selected.includes(id) && !full) onChange([...selected, id]);
    setQuery("");
    setActive(-1);
    setLocalError("");
  };

  const choose = async (opt: Option) => {
    if (opt.kind === "tag") return add(opt.tag.id);
    setCreating(true);
    setLocalError("");
    const res = await safeAction(createTagAction({ name: opt.name }));
    setCreating(false);
    if (!res.success) { setLocalError(res.error); return; }
    onTagCreated(res.data);
    add(res.data.id);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") {
      if (q || showList) e.preventDefault(); // never submit the article from the tag field
      if (showList && options[active]) void choose(options[active]);
      else if (exact && !selected.includes(exact.id)) add(exact.id); // typed an existing name
      else if (q && !exact) void choose({ kind: "create", name: q });
    } else if (e.key === "Escape") { if (open) { e.stopPropagation(); setOpen(false); } }
    else if (e.key === "Backspace" && !query && selected.length) onChange(selected.slice(0, -1));
  };

  const message = localError || error;

  return (
    <div>
      <label htmlFor={`${uid}-input`} className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2 block">
        Topic tags <span className="font-normal normal-case tracking-normal text-ink/60">(optional, up to {MAX_TAGS_PER_POST})</span>
      </label>
      {chosen.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label="Selected tags">
          {chosen.map((t) => (
            <li key={t.id} className="inline-flex items-center gap-1 rounded-full bg-lime pl-3 pr-1 py-0.5 text-xs font-bold text-forest">
              {t.name}
              <button
                type="button"
                onClick={() => onChange(selected.filter((id) => id !== t.id))}
                aria-label={`Remove tag ${t.name}`}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-forest/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={`${uid}-input`}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && options[active] ? optId(active) : undefined}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${uid}-err` : `${uid}-hint`}
          value={query}
          disabled={full || creating}
          maxLength={TAG_NAME_MAX + 10}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); setLocalError(""); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={full ? `Maximum of ${MAX_TAGS_PER_POST} tags reached` : "Search or add a tag…"}
          className={`w-full bg-white border rounded-lg px-4 py-3 text-sm text-ink placeholder-ink/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-ink/5 ${message ? "border-red-600" : "border-ink/20"}`}
        />
        {creating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" aria-label="Creating tag" />}
        {showList && (
          <ul id={listId} role="listbox" aria-label="Tag suggestions" className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-ink/15 bg-white py-1 shadow-card">
            {options.map((opt, i) => (
              <li
                key={opt.kind === "tag" ? opt.tag.id : "create"}
                id={optId(i)}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void choose(opt)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2.5 text-sm min-h-[44px] flex items-center gap-2 ${i === active ? "bg-tint text-forest" : "text-ink"}`}
              >
                {opt.kind === "tag" ? opt.tag.name : (<><Plus className="w-4 h-4 text-primary" aria-hidden /> Add <strong>“{opt.name}”</strong> tag</>)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {message ? (
        <p id={`${uid}-err`} role="alert" className="mt-1.5 text-xs font-semibold text-red-700">{message}</p>
      ) : (
        <p id={`${uid}-hint`} className="mt-1.5 text-xs text-ink/60">
          {exact && selected.includes(exact.id) ? `“${exact.name}” is already added.` : "Type to search. Tags are matched without regard to capital letters."}
        </p>
      )}
    </div>
  );
}
