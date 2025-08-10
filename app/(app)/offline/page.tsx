export const metadata = { title: 'Offline - Colrvia' }
export default function OfflinePage(){
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-2xl font-semibold mb-4">You are offline</h1>
      <p className="text-neutral-600 max-w-md mb-6">It looks like your network connection is unavailable. You can continue exploring previously loaded pages or try again once you're back online.</p>
      <button onClick={()=>window.location.reload()} className="btn btn-primary">Try again</button>
    </div>
  )
}
