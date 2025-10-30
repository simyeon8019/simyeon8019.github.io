"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

export interface StorageFileItem {
  id: string;
  name: string;
  bucket_id: string;
  owner?: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata?: Record<string, any> | null;
}

export async function listUserFiles(userId: string) {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw new Error(error.message);
  return (data || []) as StorageFileItem[];
}

export async function deleteUserFile(userId: string, fileName: string) {
  const supabase = getServiceRoleClient();
  const filePath = `${userId}/${fileName}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);
  if (error) throw new Error(error.message);
  return { ok: true } as const;
}

// 다운로드용 서명 URL 발급
export async function createSignedDownloadUrl(
  userId: string,
  fileName: string,
  expiresIn = 60,
) {
  const supabase = getServiceRoleClient();
  const filePath = `${userId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl as string;
}

// 업로드용 서명 URL 발급 (클라이언트는 uploadToSignedUrl로 업로드)
export async function createSignedUploadCredentials(
  userId: string,
  filePath: string,
) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(filePath);
  if (error) throw new Error(error.message);
  return { path: data.path, token: data.token };
}
