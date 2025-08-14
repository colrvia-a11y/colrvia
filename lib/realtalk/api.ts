import { TurnRequest, TurnResponse } from './types';

export async function postTurn(payload: TurnRequest): Promise<TurnResponse> {
  const { ack, ...rest } = payload;
  const body: Record<string, any> = { ...rest };
  if (ack) {
    body.last_question = ack.id;
    body.last_answer = Array.isArray(ack.value) ? ack.value.join(', ') : ack.value;
  }
  const res = await fetch('/api/ai/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Turn request failed');
  return res.json();
}
