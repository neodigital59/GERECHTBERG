"use client";
import React from "react";

export type CMSBlock = {
  id: string;
  type: string;
  content: any;
};

interface BlockRendererProps {
  blocks: CMSBlock[];
  className?: string;
}

function RichTextBlock({ content }: { content: any }) {
  const html = (content?.html || content?.textHtml || "").trim();
  const title = content?.title || "";
  if (!html && !title) return null;
  return (
    <section className="mt-6">
      {title ? <h2 className="text-xl font-medium mb-2">{title}</h2> : null}
      {html ? <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </section>
  );
}

function ImageBlock({ content }: { content: any }) {
  const url = content?.url || "";
  const alt = content?.alt || "";
  const caption = content?.caption || "";
  if (!url) return null;
  return (
    <figure className="mt-6">
      <img src={url} alt={alt} className="max-w-full rounded" />
      {caption ? <figcaption className="text-sm text-black/60 mt-1">{caption}</figcaption> : null}
    </figure>
  );
}

function HeroBlock({ content }: { content: any }) {
  const heading = content?.heading || "";
  const subheading = content?.subheading || "";
  const bg = content?.backgroundUrl || "";
  const ctaLabel = content?.ctaLabel || "";
  const ctaHref = content?.ctaHref || "";
  return (
    <section className="mt-6 rounded-xl overflow-hidden border">
      <div className="p-8 bg-black text-white" style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: "cover" } : undefined}>
        {heading ? <h1 className="text-2xl font-semibold mb-2">{heading}</h1> : null}
        {subheading ? <p className="text-white/80 mb-4">{subheading}</p> : null}
        {ctaLabel && ctaHref ? (
          <a href={ctaHref} className="inline-block px-4 py-2 rounded bg-brand text-white hover:bg-brand/80">
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function ListBlock({ content }: { content: any }) {
  const items: string[] = Array.isArray(content?.items) ? content.items : [];
  const title = content?.title || "";
  if (items.length === 0 && !title) return null;
  return (
    <section className="mt-6">
      {title ? <h2 className="text-xl font-medium mb-2">{title}</h2> : null}
      <ul className="list-disc pl-6">
        {items.map((it, i) => (<li key={i}>{it}</li>))}
      </ul>
    </section>
  );
}

function ButtonBlock({ content }: { content: any }) {
  const label = content?.label || "";
  const href = content?.href || "";
  if (!label || !href) return null;
  return (
    <div className="mt-6">
      <a href={href} className="inline-block px-4 py-2 rounded border hover:text-brand">
        {label}
      </a>
    </div>
  );
}

export default function BlockRenderer({ blocks, className }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className={className || "mt-6"}>
      {blocks.map((b) => {
        switch ((b.type || "").toLowerCase()) {
          case "rich_text":
          case "richtext":
          case "text":
            return <RichTextBlock key={b.id} content={b.content} />;
          case "image":
            return <ImageBlock key={b.id} content={b.content} />;
          case "hero":
            return <HeroBlock key={b.id} content={b.content} />;
          case "list":
            return <ListBlock key={b.id} content={b.content} />;
          case "button":
            return <ButtonBlock key={b.id} content={b.content} />;
          default:
            return (
              <pre key={b.id} className="mt-6 p-3 border rounded bg-black/5 text-xs overflow-auto">
                {JSON.stringify({ type: b.type, content: b.content }, null, 2)}
              </pre>
            );
        }
      })}
    </div>
  );
}