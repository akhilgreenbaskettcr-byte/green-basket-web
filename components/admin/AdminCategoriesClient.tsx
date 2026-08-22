"use client";

import { useState, useTransition } from "react";
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

interface AdminCategoriesClientProps {
  categories: Category[];
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
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
  });

  const [editForm, setEditForm] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

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
      });

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setCreateForm({ name: "", slug: "", description: "", image_url: "" });
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
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("categories").update({ is_active: !current }).eq("id", id);
    router.refresh();
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Add New Category</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
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

            {error && <p className="text-red-600 text-xs" role="alert">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-xs px-5 py-2.5"
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
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-4 py-2.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-gb-green">
              <Tags size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Manage Store Categories</p>
              <p className="text-xs text-gray-400">Add or edit category images & details</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      )}

      {/* Categories table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full" aria-label="Categories list">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Slug</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Description</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs text-gray-400 font-mono">Category Editor</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit &ldquo;{editingCategory.name}&rdquo;
                </h3>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
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

              {error && <p className="text-red-600 text-xs">{error}</p>}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-2"
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
