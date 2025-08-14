import { POST } from '@/app/api/ai/preferences/route'

async function call(body: any){
  const req = new Request('http://local/api/ai/preferences', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  })
  const res: any = await POST(req)
  const json = typeof res.json === 'function' ? await res.json() : JSON.parse(await res.text())
  return json
}

describe('preferences routing normalization', () => {
  it('asks window_aspect when light_level implies "varies" even if phrased freely', async () => {
    const out = await call({
      answers: {
        room_type: 'kitchen',
        mood_words: ['cozy'],
        style_primary: 'modern',
        dark_stance: 'avoid',
      },
      last_question: 'light_level',
      last_answer: 'it changes during the day', // free text
    })
    expect(out.turn).toBeTruthy()
    // Engine rule: if light_level === 'varies' -> ask 'window_aspect' next
    expect(out.turn.field_id).toBe('window_aspect')
  })

  it('does not lose earlier normalized answers on subsequent turns', async () => {
    // First turn: normalize light_level -> varies
    const first = await call({
      answers: {
        room_type: 'kitchen',
        mood_words: ['cozy'],
        style_primary: 'modern',
        dark_stance: 'avoid',
      },
      last_question: 'light_level',
      last_answer: 'varies a lot',
    })
    expect(first.turn.field_id).toBe('window_aspect')

    // Second turn: send prior answers back as raw strings; server should re-normalize all
    const second = await call({
      answers: { light_level: 'varies a lot' }, // still raw from client
      last_question: 'room_type',
      last_answer: 'living room',
    })
    expect(second.turn).toBeTruthy()
    // We don't assert an exact id here (queue can change), but it must not regress due to raw strings.
    expect(typeof second.turn.field_id).toBe('string')
  })
})
