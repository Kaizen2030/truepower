"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Image as ImageIcon, Upload, Sparkles } from "lucide-react";

import BlogContentRenderer from "@/components/BlogContentRenderer";
import { uploadImage } from "@/lib/supabase";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const DEFAULT_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "link",
  "image",
];

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function BlogRichTextEditor({
  value,
  onChange,
  title = "Full Article Body",
  description = "Write your article, drop in images, and add a short caption when needed. A live preview updates as you type.",
}) {
  const quillRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => imageInputRef.current?.click(),
        },
      },
    }),
    [],
  );

  const insertImageIntoEditor = (url, caption = "") => {
    const editor = quillRef.current?.getEditor?.();
    const safeCaption = `${caption || ""}`.trim();
    const captionMarkup = safeCaption
      ? `<p><em>${escapeHtml(safeCaption)}</em></p><p><br /></p>`
      : "<p><br /></p>";
    const imageMarkup = `<p><img src="${escapeHtml(url)}" alt="${escapeHtml(safeCaption)}" /></p>${captionMarkup}`;

    if (!editor) {
      onChange(`${value || ""}${imageMarkup}`);
      return;
    }

    const range = editor.getSelection(true) || { index: editor.getLength() };
    editor.clipboard.dangerouslyPasteHTML(range.index, imageMarkup, "user");
    onChange(editor.root.innerHTML);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const caption = window.prompt(
        "Optional caption for this image",
        "",
      );
      const url = await uploadImage(file, "blog-images");
      insertImageIntoEditor(url, caption || "");
    } catch (error) {
      alert(error?.message || "Unable to upload blog image.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (event) => {
    const file = event.target.files?.[0];
    await handleImageUpload(file);
    event.target.value = "";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    await handleImageUpload(file);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <label className="label">{title}</label>
            <p className="text-sm leading-relaxed text-sub">{description}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="btn-outline px-4 py-2.5 text-sm"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Upload size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon size={16} />
                  Insert image
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className={`blog-quill overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm ${
            uploading ? "ring-2 ring-brand-100" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <div className="border-b border-border bg-brand-50/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles size={14} />
              Drop images anywhere in this panel to upload and insert them
            </div>
          </div>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={DEFAULT_FORMATS}
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
            Live Preview
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sub">
            This reflects the article body exactly as it will appear on the blog page.
          </p>
        </div>

        <div className="blog-preview-shell rounded-[1.25rem] border border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/20 p-4">
          <BlogContentRenderer content={value} className="blog-rich-content" />
          {!value?.trim() ? (
            <p className="text-sm text-sub">
              Start typing to see the preview here.
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
