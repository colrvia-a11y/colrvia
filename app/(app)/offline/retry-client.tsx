"use client";

export default function OfflineRetry(){
  return (
    <button type="button" onClick={()=>window.location.reload()} className="btn btn-primary">Try again</button>
  );
}
