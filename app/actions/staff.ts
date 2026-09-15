"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";

// Supabase Admin client (service role — bypasses RLS, can create users)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleKey || serviceRoleKey === "your_service_role_key_here") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local");
  }
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Verify the calling user is admin
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden: Admin only");
  return supabase;
}

const CreateStaffSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateStaffResult =
  | { success: true; email: string }
  | { success: false; error: string };

export async function createStaffAccount(formData: {
  full_name: string;
  email: string;
  password: string;
}): Promise<CreateStaffResult> {
  try {
    await requireAdmin();

    const parsed = CreateStaffSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const adminClient = getAdminClient();

    // Create auth user via admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true, // auto-confirm, no verification email
      user_metadata: { full_name: parsed.data.full_name },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Upsert profile with staff role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (adminClient as any)
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: parsed.data.email,
        full_name: parsed.data.full_name,
        role: "staff",
      });

    if (profileError) {
      // Rollback: delete the auth user if profile upsert fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: "Failed to create staff profile: " + profileError.message };
    }

    return { success: true, email: parsed.data.email };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export type DeleteStaffResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteStaffAccount(userId: string): Promise<DeleteStaffResult> {
  try {
    await requireAdmin();

    // Verify the target is a staff (not admin) before deleting
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role === "admin") {
      return { success: false, error: "Cannot delete an admin account from here." };
    }
    if (profile?.role !== "staff") {
      return { success: false, error: "User is not a staff member." };
    }

    const adminClient = getAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export async function listStaffAccounts(): Promise<{
  id: string; email: string; full_name: string | null; created_at: string;
}[]> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("role", "staff")
      .order("created_at", { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}
