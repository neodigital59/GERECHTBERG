"use client";
import React from "react";

export type BlockType = "rich_text" | "image" | "hero" | "list" | "button";

interface BlockFormProps {
  type: BlockType;
  content: any;
  onChange: (next: any) => void;
}

export default function BlockForm({ type, content, onChange }: BlockFormProps) {
  switch (type) {
    case "rich_text":
      return (
        <div className="space-y-2">
          <label className="block text-sm">Titre (optionnel)</label>
          <input className="w-full border rounded px-3 py-2" value={content?.title || ""} onChange={(e)=>onChange({ ...content, title: e.target.value })} />
          <label className="block text-sm">HTML</label>
          <textarea className="w-full border rounded px-3 py-2 h-32" value={content?.html || content?.textHtml || ""} onChange={(e)=>onChange({ ...content, html: e.target.value })} />
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <label className="block text-sm">URL</label>
          <input className="w-full border rounded px-3 py-2" value={content?.url || ""} onChange={(e)=>onChange({ ...content, url: e.target.value })} />
          <label className="block text-sm">Alt</label>
          <input className="w-full border rounded px-3 py-2" value={content?.alt || ""} onChange={(e)=>onChange({ ...content, alt: e.target.value })} />
          <label className="block text-sm">Légende</label>
          <input className="w-full border rounded px-3 py-2" value={content?.caption || ""} onChange={(e)=>onChange({ ...content, caption: e.target.value })} />
        </div>
      );
    case "hero":
      return (
        <div className="space-y-2">
          <label className="block text-sm">Titre</label>
          <input className="w-full border rounded px-3 py-2" value={content?.heading || ""} onChange={(e)=>onChange({ ...content, heading: e.target.value })} />
          <label className="block text-sm">Sous-titre</label>
          <input className="w-full border rounded px-3 py-2" value={content?.subheading || ""} onChange={(e)=>onChange({ ...content, subheading: e.target.value })} />
          <label className="block text-sm">Image de fond (URL)</label>
          <input className="w-full border rounded px-3 py-2" value={content?.backgroundUrl || ""} onChange={(e)=>onChange({ ...content, backgroundUrl: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm">CTA label</label>
              <input className="w-full border rounded px-3 py-2" value={content?.ctaLabel || ""} onChange={(e)=>onChange({ ...content, ctaLabel: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm">CTA href</label>
              <input className="w-full border rounded px-3 py-2" value={content?.ctaHref || ""} onChange={(e)=>onChange({ ...content, ctaHref: e.target.value })} />
            </div>
          </div>
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <label className="block text-sm">Titre (optionnel)</label>
          <input className="w-full border rounded px-3 py-2" value={content?.title || ""} onChange={(e)=>onChange({ ...content, title: e.target.value })} />
          <label className="block text-sm">Éléments (un par ligne)</label>
          <textarea className="w-full border rounded px-3 py-2 h-28" value={Array.isArray(content?.items) ? content.items.join("\n") : ""} onChange={(e)=>onChange({ ...content, items: e.target.value.split(/\r?\n/).filter(Boolean) })} />
        </div>
      );
    case "button":
      return (
        <div className="space-y-2">
          <label className="block text-sm">Libellé</label>
          <input className="w-full border rounded px-3 py-2" value={content?.label || ""} onChange={(e)=>onChange({ ...content, label: e.target.value })} />
          <label className="block text-sm">Lien (href)</label>
          <input className="w-full border rounded px-3 py-2" value={content?.href || ""} onChange={(e)=>onChange({ ...content, href: e.target.value })} />
        </div>
      );
    default:
      return (
        <div className="space-y-2">
          <label className="block text-sm">JSON du bloc</label>
          <textarea
            className="w-full border rounded px-3 py-2 h-40 font-mono text-xs"
            value={JSON.stringify(content ?? {}, null, 2)}
            onChange={(e) => {
              try { onChange(JSON.parse(e.target.value)); } catch {/* ignore */}
            }}
          />
        </div>
      );
  }
}