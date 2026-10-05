"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Tags,
  Image as ImageIcon,
  ExternalLink,
  Edit3,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";
import { toggleCategoryActiveAction } from "@/app/actions/products";

interface AdminCategoriesClientProps {
  categories: Category[];
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  gst_enabled: boolean;
  gst_percentage: number;
}

export function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [createForm, setCreateForm] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    gst_enabled: false,
    gst_percentage: 0,
  });

  const [editForm, setEditForm] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    gst_enabled: false,
    gst_percentage: 0,
  });

  // Lock background scrolling when edit modal is active
  useEffect(() => {
    if (!editingCategory) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // In the admin dashboard, <main> is the overflowing scroll container
    const mainEl = document.querySelector("main");
    const originalMainOverflow = mainEl ? mainEl.style.overflow : "";
    if (mainEl) {
      mainEl.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingCategory(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingCategory]);

  const handleCreateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({
      ...prev,
      name: e.target.value,
      slug: generateSlug(e.target.value),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return setError("Category name is required.");

    setError("");
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any).from("categories").insert({
        name: createForm.name.trim(),
        slug: createForm.slug.trim() || generateSlug(createForm.name),
        description: createForm.description.trim() || null,
        image_url: createForm.image_url.trim() || null,
        is_active: true,
        sort_order: categories.length + 1,
        gst_enabled: createForm.gst_enabled,
        gst_percentage: createForm.gst_enabled ? Number(createForm.gst_percentage) || 0 : 0,
      });

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setCreateForm({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        gst_enabled: false,
        gst_percentage: 0,
      });
      setShowCreateForm(false);
      setSuccessMessage("Category created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    });
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      image_url: cat.image_url ?? "",
      gst_enabled: Boolean(cat.gst_enabled),
      gst_percentage: Number(cat.gst_percentage) || 0,
    });
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editForm.name.trim()) return setError("Category name is required.");

    setError("");
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("categories")
        .update({
          name: editForm.name.trim(),
          slug: editForm.slug.trim() || generateSlug(editForm.name),
          description: editForm.description.trim() || null,
          image_url: editForm.image_url.trim() || null,
          gst_enabled: editForm.gst_enabled,
          gst_percentage: editForm.gst_enabled ? Number(editForm.gst_percentage) || 0 : 0,
        })
        .eq("id", editingCategory.id);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setEditingCategory(null);
      setSuccessMessage(`Updated "${editForm.name}" successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    });
  };

  const toggleActive = async (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleCategoryActiveAction(id, current);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Add New Category form card */}
      {showCreateForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Add New Category</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 p-1"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cat-name" className="gb-label">Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  value={createForm.name}
                  onChange={handleCreateNameChange}
                  className="gb-input"
                  placeholder="e.g. Traditional Oils"
                  required
                />
              </div>
              <div>
                <label htmlFor="cat-slug" className="gb-label">URL Slug</label>
                <input
                  id="cat-slug"
                  type="text"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))}
                  className="gb-input font-mono text-sm"
                  placeholder="traditional-oils"
                />
              </div>
            </div>

            <div>
              <ImageUpload
                label="Category Card Image"
                value={createForm.image_url}
                onChange={(url) => setCreateForm((p) => ({ ...p, image_url: url }))}
                bucket="category-images"
                helperText="Upload category thumbnail for homepage card"
              />
            </div>

            <div>
              <label htmlFor="cat-desc" className="gb-label">Short Description</label>
              <textarea
                id="cat-desc"
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                className="gb-input resize-none"
                rows={2}
                placeholder="Cold-pressed coconut oil, sesame oil, and authentic Kerala cooking fats."
              />
            </div>

            {/* GST Configuration Box */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">GST (Goods & Services Tax)</p>
                  <p className="text-[11px] text-gray-500">Enable if items in this category attract GST during checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateForm((p) => ({ ...p, gst_enabled: !p.gst_enabled }))}
                  className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors self-start sm:self-auto ${
                    createForm.gst_enabled
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {createForm.gst_enabled ? (
                    <ToggleRight size={16} className="text-amber-600" />
                  ) : (
                    <ToggleLeft size={16} className="text-gray-400" />
                  )}
                  {createForm.gst_enabled ? "GST Applicable" : "No GST"}
                </button>
              </div>

              {createForm.gst_enabled && (
                <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label htmlFor="cat-gst-pct" className="block text-[11px] font-semibold text-gray-700 mb-1">
                      GST Percentage Rate (%) *
                    </label>
                    <div className="relative">
                      <input
                        id="cat-gst-pct"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={createForm.gst_percentage || ""}
                        onChange={(e) =>
                          setCreateForm((p) => ({ ...p, gst_percentage: parseFloat(e.target.value) || 0 }))
                        }
                        className="gb-input pr-8 text-sm"
                        placeholder="e.g. 5, 12, 18"
                        required={createForm.gst_enabled}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        %
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed sm:pt-4">
                    Items under this category will automatically calculate {createForm.gst_percentage || 0}% GST at checkout.
                  </p>
                </div>
              )}
            </div>

            {error && <p className="text-red-600 text-xs" role="alert">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Category"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-4 py-2.5 border border-gray-200 sm:border-transparent rounded-xl sm:rounded-none text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-gb-green shrink-0">
              <Tags size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">Manage Store Categories</p>
              <p className="text-xs text-gray-400 truncate sm:whitespace-normal">Add or edit category images, GST rates & details</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary text-xs flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 shrink-0 w-full sm:w-auto"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      )}

      {/* Mobile Categories Card List (< md) */}
      <div className="md:hidden space-y-3.5">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <Tags size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No categories found</p>
            <p className="text-xs text-gray-400 mt-1">Get started by creating your first category</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary text-xs inline-flex items-center gap-1.5 px-4 py-2 mt-4"
            >
              <Plus size={14} /> Add Category
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3.5"
            >
              {/* Top Section: Category Image, Name, Slug & Change Image Action */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-50 relative overflow-hidden shrink-0 border border-gray-200">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized={cat.image_url.startsWith("data:")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug break-words">
                      {cat.name}
                    </h3>
                    <Link
                      href={`/categories/${cat.slug}`}
                      target="_blank"
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors shrink-0 -mt-0.5"
                      title="View public category page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>

                  <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                    /{cat.slug}
                  </p>

                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="text-[11px] text-gb-green hover:underline font-medium inline-flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Edit3 size={11} /> Change Image
                  </button>
                </div>
              </div>

              {/* Middle Section: GST Rate and Status Toggle */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100/80">
                {/* GST Rate pill */}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    GST Rate
                  </span>
                  <div className="mt-0.5">
                    {cat.gst_enabled && Number(cat.gst_percentage) > 0 ? (
                      <span className="inline-flex items-center text-[11px] font-bold text-amber-800">
                        {cat.gst_percentage}% GST
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500 font-medium">
                        0% (No GST)
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Toggle Button */}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </span>
                  <div className="mt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleActive(cat.id, cat.is_active)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        cat.is_active
                          ? "bg-green-100/80 text-green-800 hover:bg-green-200/80"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      aria-label={cat.is_active ? "Deactivate category" : "Activate category"}
                    >
                      {cat.is_active ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                      <span>{cat.is_active ? "Active" : "Inactive"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description box */}
              {cat.description && (
                <div className="text-xs text-gray-600 bg-gray-50/70 rounded-xl p-2.5 border border-gray-100 leading-relaxed break-words">
                  {cat.description}
                </div>
              )}

              {/* Action Buttons row */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gb-green bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200/60 py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Category
                </button>
                <Link
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 py-2.5 px-3 rounded-xl transition-colors shrink-0"
                  title="View category page"
                >
                  <ExternalLink size={13} />
                  <span>View</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Categories table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Categories list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Slug</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">GST Rate</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Description</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Tags size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-bold text-gray-700">No categories found</p>
                    <p className="text-xs text-gray-400 mt-1">Get started by creating your first category</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Category Thumbnail & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                          {cat.image_url ? (
                            <Image
                              src={cat.image_url}
                              alt={cat.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized={cat.image_url.startsWith("data:")}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                          <button
                            onClick={() => openEditModal(cat)}
                            className="text-[11px] text-gb-green hover:underline font-medium flex items-center gap-1 mt-0.5"
                          >
                            <Edit3 size={11} /> Change Image / Edit
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{cat.slug}</td>

                    {/* GST Rate Column */}
                    <td className="px-6 py-4">
                      {cat.gst_enabled && Number(cat.gst_percentage) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {cat.gst_percentage}% GST
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">0% (No GST)</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {cat.description ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(cat.id, cat.is_active)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          cat.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        aria-label={cat.is_active ? "Deactivate category" : "Activate category"}
                      >
                        {cat.is_active ? (
                          <ToggleRight size={16} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={16} className="text-gray-400" />
                        )}
                        {cat.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <Link
                          href={`/categories/${cat.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="View category page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase tracking-wider">Category Editor</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  Edit &ldquo;{editingCategory.name}&rdquo;
                </h3>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="gb-label">Category Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="gb-input"
                  required
                />
              </div>

              <div>
                <label className="gb-label">URL Slug</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  className="gb-input font-mono text-sm"
                />
              </div>

              <div>
                <ImageUpload
                  label="Category Card Image"
                  value={editForm.image_url}
                  onChange={(url) => setEditForm((p) => ({ ...p, image_url: url }))}
                  bucket="category-images"
                  helperText="Upload new category image for the homepage cards"
                />
              </div>

              <div>
                <label className="gb-label">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  className="gb-input resize-none"
                  rows={2}
                />
              </div>

              {/* GST Configuration Box in Edit Modal */}
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-900">GST (Goods & Services Tax)</p>
                    <p className="text-[11px] text-gray-500">Enable if items in this category attract GST</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, gst_enabled: !p.gst_enabled }))}
                    className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors self-start sm:self-auto ${
                      editForm.gst_enabled
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {editForm.gst_enabled ? (
                      <ToggleRight size={16} className="text-amber-600" />
                    ) : (
                      <ToggleLeft size={16} className="text-gray-400" />
                    )}
                    {editForm.gst_enabled ? "GST Applicable" : "No GST"}
                  </button>
                </div>

                {editForm.gst_enabled && (
                  <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label htmlFor="cat-edit-gst-pct" className="block text-[11px] font-semibold text-gray-700 mb-1">
                        GST Percentage Rate (%) *
                      </label>
                      <div className="relative">
                        <input
                          id="cat-edit-gst-pct"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editForm.gst_percentage || ""}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, gst_percentage: parseFloat(e.target.value) || 0 }))
                          }
                          className="gb-input pr-8 text-sm"
                          placeholder="e.g. 5, 12, 18"
                          required={editForm.gst_enabled}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                          %
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed sm:pt-4">
                      Items under this category will automatically calculate {editForm.gst_percentage || 0}% GST at checkout.
                    </p>
                  </div>
                )}
              </div>

              {error && <p className="text-red-600 text-xs">{error}</p>}

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 sm:border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary text-xs px-5 py-2.5 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
