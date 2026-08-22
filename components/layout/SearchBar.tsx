"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/categories?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Search products"
      >
        <Search size={20} className="text-gb-charcoal" aria-hidden="true" />
      </button>

      {/* Search overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Search box */}
          <div
            className="relative w-full max-w-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-2xl border border-gray-100">
                <Search
                  size={18}
                  className="text-gray-400 shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, categories…"
                  className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                  aria-label="Search query"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <X size={16} className="text-gray-500" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
