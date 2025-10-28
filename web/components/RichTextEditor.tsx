"use client";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onInsertImage?: (cb: (url: string) => void) => void;
};

export default function RichTextEditor({ value, onChange, onInsertImage }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Keep DOM in sync when value changes externally
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function exec(cmd: string, val?: string) {
    try {
      // S’assure que le contentEditable a le focus pour que la commande s’applique
      if (ref.current) {
        ref.current.focus();
      }
      document.execCommand(cmd, false, val);
      if (ref.current) onChange(ref.current.innerHTML);
    } catch {}
  }

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function insertLink() {
    const url = prompt("Entrer l’URL du lien:");
    if (!url) return;
    exec("createLink", url);
  }

  function insertImage() {
    if (onInsertImage) {
      onInsertImage((url) => {
        if (!url) return;
        exec("insertImage", url);
      });
      return;
    }
    const url = prompt("Entrer l’URL de l’image:");
    if (!url) return;
    exec("insertImage", url);
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2 bg-black/5 text-sm">
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("bold")}>Gras</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("italic")}>Italique</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("underline")}>Souligner</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("insertOrderedList")}>Liste numérotée</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("insertUnorderedList")}>Liste</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={insertLink}>Lien</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("formatBlock", "<h2>")}>Titre H2</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("formatBlock", "<h3>")}>Titre H3</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={insertImage}>Image</button>
        <button type="button" className="px-2 py-1 rounded border" onMouseDown={(e)=>e.preventDefault()} onClick={() => exec("removeFormat")}>Effacer format</button>
      </div>
      <div
        ref={ref}
        className="min-h-40 p-3 prose dark:prose-invert"
        contentEditable
        suppressHydrationWarning
        onInput={handleInput}
        onBlur={handleInput}
        aria-label="Éditeur de texte riche"
        role="textbox"
      />
    </div>
  );
}