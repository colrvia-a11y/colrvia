# Voice Interview — Quick Triage

**Symptoms:** “Starting voice…” then switches to text; no audio.

**Checklist**
1) `OPENAI_API_KEY` exists in this Vercel environment (Preview/Prod) and is valid.
2) Voice is enabled (`NEXT_PUBLIC_VOICE_ENABLED="true"` or use `?voice=on`).
3) Watch `/debug/voice`:
   - Session: ✅ client_secret shape
   - Mic: ✅ permission granted
   - Policy: ✅ microphone allowed, not inside iframe
4) Browser console on `/start?voice=on&diag=1`:
   - Look for `offer failed …` (model/url/env).
   - Status bar reason shows the failing step.
5) Network: allow `https://api.openai.com/v1/realtime/*`.

**If all green but no audio:** ensure `<audio>` element is present and `ontrack` sets `srcObject` + calls `play()` after user tap.

