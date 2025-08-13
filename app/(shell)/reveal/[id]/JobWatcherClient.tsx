"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { track } from '@/lib/analytics/client';

interface Props { jobId: string }

export default function JobWatcherClient({ jobId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>('queued');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(!jobId) return;
    if(!/^[0-9a-fA-F-]{36}$/.test(jobId)) return;
    const sb = supabaseBrowser();
    const channel = sb.channel(`job-${jobId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` }, (payload) => {
        const row: any = payload.new;
        if(row.status) setStatus(row.status);
        if(row.error) setError(row.error);
        if(row.status === 'ready' && row.story_id){
          const t0 = (window as any).__intakeStartTs as number | undefined;
          if(t0){
            track('render_complete', { story_id: row.story_id || row.id, ms: Math.round(performance.now() - t0) });
          }
          router.replace(`/reveal/${row.story_id}`);
        }
      })
      .subscribe();
    sb.from('jobs').select('status,story_id,error').eq('id', jobId).single().then(({ data }) => {
      if(data){
        setStatus(data.status as string);
        if(data.error) setError(data.error);
        if(data.status === 'ready' && (data as any).story_id){
          const t0 = (window as any).__intakeStartTs as number | undefined;
          if(t0){
            track('render_complete', { story_id: (data as any).story_id || jobId, ms: Math.round(performance.now() - t0) });
          }
          router.replace(`/reveal/${(data as any).story_id}`);
        }
      }
    });
    return () => { sb.removeChannel(channel); };
  }, [jobId, router]);

  if(error){
    return <div className="mt-6 text-sm text-red-600">Job failed: {error}</div>;
  }
  if(status === 'processing'){
    return <div className="mt-6 text-xs text-muted-foreground" aria-live="polite">Rendering…</div>;
  }
  return null;
}
