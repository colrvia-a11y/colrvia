'use client'
import { useState } from 'react'
import { ChatScreen } from '@/components/chat/ChatScreen'
import { MessageList, type Msg } from '@/components/chat/MessageList'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { Composer } from '@/components/chat/Composer'
import { QuickReplies } from '@/components/chat/QuickReplies'

export default function Page(){
  const [msgs,setMsgs]=useState<Msg[]>([
    { id:'g1', sender:'assistant', text:'Hey! Want to upload a room photo to get started?' }
  ])
  const [typing,setTyping]=useState(false)
  async function send(t:string){
    const id = String(Date.now())
    const userMsg: Msg = { id, sender:'user', text:t }
    const nextMsgs = [...msgs, userMsg]
    setMsgs(nextMsgs)
    setTyping(true)
    try{
      const resp = await fetch('/api/via/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: nextMsgs.map(m => ({ role: m.sender, content: m.text ?? '' })) })
      }).then(r=>r.json())
      const reply: string | undefined = resp?.reply
      if(reply) setMsgs(v=>[...v, { id:id+'a', sender:'assistant', text: reply }])
    } catch(e){
      setMsgs(v=>[...v, { id:id+'e', sender:'assistant', text: 'Sorry—try again.' }])
    } finally {
      setTyping(false)
    }
  }
  return (
    <ChatScreen>
      <MessageList messages={msgs}/>
      <QuickReplies options={['Upload Room 📸','Skip for now','Show sample palettes']} onPick={send} />
      {typing && <TypingIndicator/>}
      <Composer onSend={send}/>
    </ChatScreen>
  )
}

