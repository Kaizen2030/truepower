"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Image as ImageIcon, Upload } from "lucide-react";
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

export default function BlogRichTextEditor({
  value,
  onChange,
  title = "Full Article Body",
  description = "Write your article, then insert images anywhere in the story using the image button.",
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

  const insertImageIntoEditor = (url) => {
    const editor = quillRef.current?.getEditor?.();

    if (!editor) {
      onChange(`${value || ""}<p><img src="${url}" alt="" /></p>`);
      return;
    }

    const range = editor.getSelection(true) || { index: editor.getLength() };
    editor.insertEmbed(range.index, "image", url, "user");
    editor.insertText(range.index + 1, "\n", "user");
    editor.setSelection(range.index + 2, 0, "silent");
    onChange(editor.root.innerHTML);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImage(file, "blog-images");
      insertImageIntoEditor(url);
    } catch (error) {
      alert(error?.message || "Unable to upload blog image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="label">{title}</label>
          <p className="text-sm leading-relaxed text-sub">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="btn-outline shrink-0 px-4 py-2.5 text-sm"
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

      <div className="blog-quill overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={DEFAULT_FORMATS}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
