export const ssml = {
  mossAsk: (s: string) => `<speak><prosody rate="0.98">${s}</prosody></speak>`,
  mossEmpath: (s: string) => `<speak><prosody rate="0.98"><break time="200ms"/>${s}</prosody></speak>`,
};
