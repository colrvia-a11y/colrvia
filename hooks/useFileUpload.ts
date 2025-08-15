'use client';

import { useCallback, useState } from 'react';

type Upload = {
  id: string;
  file: File;
  preview: string; // object URL for <img>
  dataUrl?: string; // base64 data URL for vision API
};

export default function useFileUpload(opts?: {
  accept?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  makeDataUrl?: boolean; // when true, generate base64 data URL for images
}) {
  const { accept = [], maxFiles = 6, maxSizeMB = 12, makeDataUrl = false } = opts ?? {};
  const [files, setFiles] = useState<Upload[]>([]);

  const matches = (f: File) => {
    if (accept.length === 0) return true;
    return accept.some((a) => {
      if (a.endsWith('/*')) return f.type.startsWith(a.slice(0, -1));
      if (a.startsWith('.')) return f.name.toLowerCase().endsWith(a);
      return f.type === a;
    });
  };

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (list: FileList) => {
    const incoming = Array.from(list);
    const accepted = incoming.filter((f) => matches(f) && f.size <= (maxSizeMB * 1024 * 1024));
    const next = [...files];

    for (const f of accepted) {
      if (next.length >= maxFiles) break;
      const upload: Upload = {
        id: crypto.randomUUID(),
        file: f,
        preview: URL.createObjectURL(f),
      };
      if (makeDataUrl && f.type.startsWith('image/')) {
        upload.dataUrl = await toDataUrl(f);
      }
      next.push(upload);
    }
    setFiles(next);
  }, [files, maxFiles, maxSizeMB, makeDataUrl]);

  const removeFile = useCallback((id: string) => setFiles((prev) => prev.filter((f) => f.id !== id)), []);
  const clear = useCallback(() => setFiles([]), []);

  return { files, addFiles, removeFile, clear };
}

