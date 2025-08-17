import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const ChatScreen = nextDynamic(() => import("@/components/chat/ChatScreen"), {
  ssr: false,
});

export default function Page() {
  return <ChatScreen />;
}
