import { TurnRequest, TurnResponse } from './types';

export async function postTurn(payload: TurnRequest): Promise<TurnResponse> {
  const res = await fetch('/api/ai/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Turn request failed');
  return res.json();
}
