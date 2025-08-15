// tiny pure helper so we can unit test the greeting visibility logic
export function shouldShowGreeting(messageCount: number) {
  return messageCount === 0
}
