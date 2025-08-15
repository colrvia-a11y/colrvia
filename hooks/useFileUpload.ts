'use client';

import { useCallback, useState } from 'react';

type Upload = {
  id: string;
  file: File;
  preview: string;
};

export default function useFileUpload(opts?: {
  accept?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
}) {
  const { accept = [], maxFiles = 6, maxSizeMB = 12 } = opts ?? {};
  const [files, setFiles] = useState<Upload[]>([]);

  const addFiles = useCallback((list: FileList) => {
    const incoming = Array.from(list);
    const accepted = incoming.filter((f) => {
      const okType = accept.length === 0 || accept.some(a => {
        if (a.endsWith('/*')) return f.type.startsWith(a.slice(0, -1));
        if (a.startsWith('.')) return f.name.toLowerCase().endsWith(a);
        return f.type === a;
      });
      const okSize = f.size <= maxSizeMB * 1024 * 1024;
      return okType && okSize;
    });
    const next = [...files];
    for (const f of accepted) {
      if (next.length >= maxFiles) break;
      next.push({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) });
    }
    setFiles(next);
  }, [files, accept, maxFiles, maxSizeMB]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clear = useCallback(() => setFiles([]), []);

  return { files, addFiles, removeFile, clear };
}

