import { Answers } from './types';

function pushIfUnanswered(q: string[], a: Answers, id: string) {
  if (a[id] === undefined) q.push(id);
}

function needs(a: Answers, id: string): boolean {
  switch (id) {
    case 'dark_locations':
      return a.dark_locations === undefined && ['walls', 'accents', 'open'].includes(a.dark_stance);
    default:
      return false;
  }
}

function appendRoomModule(q: string[], a: Answers) {
  switch (a.room_type) {
    case 'kitchen':
      pushIfUnanswered(q, a, 'K1');
      if (Array.isArray(a.K1) && a.K1.length >= 2) pushIfUnanswered(q, a, 'K1a');
      break;
    case 'bathroom':
      pushIfUnanswered(q, a, 'B1');
      if (Array.isArray(a.B1) && a.B1.length >= 2) pushIfUnanswered(q, a, 'B1a');
      break;
    case 'living':
    case 'dining':
    case 'bedroom':
    case 'office':
      pushIfUnanswered(q, a, 'L1');
      if (Array.isArray(a.L1) && a.L1.length >= 2) pushIfUnanswered(q, a, 'L1a');
      break;
    case 'nursery':
    case 'kid':
      pushIfUnanswered(q, a, 'N1');
      break;
    case 'hallway':
    case 'entry':
      pushIfUnanswered(q, a, 'H1');
      if (a.adjacent_primary_color === undefined) q.push('adjacent_primary_color');
      break;
    case 'open':
      pushIfUnanswered(q, a, 'O1');
      if (a.O2 === undefined) q.push('O2');
      break;
    default:
      break;
  }
}

function hasColorRules(a: Answers): boolean {
  return Array.isArray(a.constraints) && a.constraints.includes('color_rules');
}

export function capByPriority(q: string[], a: Answers) {
  const MAX = 15;
  const DROP_ORDER = ['K1a', 'B1a', 'L1a', 'O2', 'dark_locations', 'window_aspect', 'adjacent_primary_color'];
  if (q.length <= MAX) return;
  for (const id of DROP_ORDER) {
    const idx = q.indexOf(id);
    if (idx !== -1) {
      q.splice(idx, 1);
      if (q.length <= MAX) return;
    }
  }
  while (q.length > MAX) q.pop();
}

export function buildQuestionQueue(a: Answers): string[] {
  const q: string[] = [];

  // PHASE A: STYLE
  pushIfUnanswered(q, a, 'style_primary');
  pushIfUnanswered(q, a, 'mood_words');
  pushIfUnanswered(q, a, 'dark_stance');
  if (needs(a, 'dark_locations')) q.push('dark_locations');

  // PHASE B: ROOM DETAILS
  pushIfUnanswered(q, a, 'room_type');
  pushIfUnanswered(q, a, 'light_level');
  if (a.light_level === 'varies') q.push('window_aspect');

  appendRoomModule(q, a);

  pushIfUnanswered(q, a, 'constraints');
  if (hasColorRules(a)) q.push('avoid_colors');

  capByPriority(q, a);
  return q;
}
