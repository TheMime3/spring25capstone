export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url: string;
  publicUrl: string;
  scriptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoUploadParams {
  file: File;
  title: string;
  description?: string;
  scriptId?: string;
}