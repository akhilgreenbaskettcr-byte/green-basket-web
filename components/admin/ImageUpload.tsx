"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Link as LinkIcon, Loader2, Image as ImageIcon, Cloud } from "lucide-react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  helperText?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  label = "Image",
  helperText = "Upload high-resolution image to Cloudinary CDN",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      // Upload to Cloudinary via server API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image to Cloudinary");
      }

      onChange(data.url);
      setUrlInput(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="gb-label mb-0">{label}</label>
          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Cloud size={10} /> Cloudinary
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "file" ? "url" : "file")}
          className="text-xs text-gb-green hover:underline flex items-center gap-1 font-medium"
        >
          {mode === "file" ? (
            <>
              <LinkIcon size={12} /> Use Image URL
            </>
          ) : (
            <>
              <Upload size={12} /> Upload File
            </>
          )}
        </button>
      </div>

      {value && value.trim() !== "" ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-white aspect-video max-h-56 flex items-center justify-center">
          {value.startsWith("http") || value.startsWith("/") || value.startsWith("data:") ? (
            <Image
              src={value}
              alt="Uploaded preview"
              fill
              className="object-contain p-2"
              sizes="400px"
              unoptimized={value.startsWith("data:")}
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ImageIcon size={24} />
              <span>{value}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-gb-charcoal text-xs font-semibold hover:bg-gray-100 transition-colors shadow-sm"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              title="Delete image"
              aria-label="Delete image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : mode === "file" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-gb-green rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/70 hover:bg-green-50/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={26} className="animate-spin text-gb-green" />
              <p className="text-xs text-gray-600 font-medium">Uploading directly to Cloudinary CDN…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-gb-green">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gb-charcoal">
                  Click to select & upload to Cloudinary
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://res.cloudinary.com/pjgmmeb8/image/upload/..."
            className="gb-input flex-1 text-sm py-2"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="btn-primary text-xs px-4 py-2"
          >
            Apply
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mt-1 font-medium">{uploadError}</p>
      )}
    </div>
  );
}
