import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const InterviewChat = nextDynamic(() => import("@/components/chat/InterviewChat"), { ssr: false });

export default function Page() {
  return (
    <main className="px-4 pb-8 pt-4">
      <InterviewChat />
    </main>
  );
}
