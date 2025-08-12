import type { QuestionId, Priority, Answers } from './types';

export type InputKind = 'single' | 'multi' | 'text' | 'chipText' | 'photo';

export interface Question {
  id: QuestionId;
  field: keyof Answers | null;
  text: string;
  type: InputKind;
  options?: string[];
  priority: Priority;
  required?: boolean;
  condition?: (a: Answers) => boolean;
}

export const QUESTIONS: Record<QuestionId, Question> = {
  room_type: {
    id: 'room_type',
    field: 'room_type',
    text: 'Which space are we designing?',
    type: 'single',
    options: ['living_room','kitchen','bedroom_adult','bedroom_kid','nursery','bathroom','dining','home_office','hallway_entry','open_concept'],
    priority: 'P1',
    required: true,
  },
  mood_words: {
    id: 'mood_words',
    field: 'mood_words',
    text: 'In three words, how should this room feel?',
    type: 'chipText',
    priority: 'P1',
    required: true,
  },
  style_primary: {
    id: 'style_primary',
    field: 'style_primary',
    text: 'Which style resonates most?',
    type: 'single',
    options: ['Modern Minimalist','Organic Cottage','Moody Traditional','Japandi','Scandinavian','Industrial','Bohemian','Coastal','Mid-Century','Transitional','Not sure / Mix'],
    priority: 'P1',
    required: true,
  },
  light_level: {
    id: 'light_level',
    field: 'light_level',
    text: 'How would you describe the natural light?',
    type: 'single',
    options: ['bright','moderate','low','varies'],
    priority: 'P1',
    required: true,
  },
  window_aspect: {
    id: 'window_aspect',
    field: 'window_aspect',
    text: 'Which direction do your main windows face?',
    type: 'single',
    options: ['north','south','east','west','multiple','unknown'],
    priority: 'P3',
    condition: a => a.light_level === 'varies',
  },
  dark_stance: {
    id: 'dark_stance',
    field: 'dark_stance',
    text: 'How do you feel about darker/bolder colors?',
    type: 'single',
    options: ['walls','accents','avoid','open'],
    priority: 'P1',
    required: true,
  },
  dark_locations: {
    id: 'dark_locations',
    field: 'dark_locations',
    text: 'Where might you want darker/bolder colors?',
    type: 'multi',
    options: ['all_walls','accent_wall','ceiling','trim_doors','cabinetry','designer_suggest'],
    priority: 'P3',
    condition: a => a.dark_stance !== 'avoid' && !!a.dark_stance,
  },
  k_fixed_elements: {
    id: 'k_fixed_elements',
    field: 'fixed_elements',
    text: 'What fixed elements need to coordinate with your paint?',
    type: 'multi',
    options: ['ctops','backsplash','cabinets','flooring','appliances','none'],
    priority: 'P1',
    condition: a => a.room_type === 'kitchen',
  },
  k_fixed_details: {
    id: 'k_fixed_details',
    field: 'fixed_details',
    text: 'Quick details on your main fixed elements',
    type: 'text',
    priority: 'P4',
    condition: a => a.room_type === 'kitchen' && (a.fixed_elements?.filter(e => ['ctops','backsplash','cabinets','flooring','appliances'].includes(e)).length || 0) >= 2 && !a.fixed_elements?.includes('none'),
  },
  b_fixed_elements: {
    id: 'b_fixed_elements',
    field: 'fixed_elements',
    text: 'What fixed elements need to coordinate with your paint?',
    type: 'multi',
    options: ['vanity_top','tile','fixtures_finish','bath_flooring','none'],
    priority: 'P1',
    condition: a => a.room_type === 'bathroom',
  },
  b_fixed_details: {
    id: 'b_fixed_details',
    field: 'fixed_details',
    text: 'Quick details on your main fixed elements',
    type: 'text',
    priority: 'P4',
    condition: a => a.room_type === 'bathroom' && (a.fixed_elements?.filter(e => ['vanity_top','tile','fixtures_finish','bath_flooring'].includes(e)).length || 0) >= 2 && !a.fixed_elements?.includes('none'),
  },
  l_anchors_keep: {
    id: 'l_anchors_keep',
    field: 'fixed_elements',
    text: 'Anchors & keepers to coordinate?',
    type: 'multi',
    options: ['wood_floor','fireplace','builtins_trim','major_furniture','rugs_textiles','artwork','none'],
    priority: 'P1',
    condition: a => ['living_room','dining','bedroom_adult','home_office','open_concept'].includes(a.room_type||''),
  },
  l_fixed_details: {
    id: 'l_fixed_details',
    field: 'fixed_details',
    text: 'Quick details on your main fixed elements',
    type: 'text',
    priority: 'P4',
    condition: a => ['living_room','dining','bedroom_adult','home_office','open_concept'].includes(a.room_type||'') && (a.fixed_elements?.filter(e => ['wood_floor','fireplace','builtins_trim','major_furniture','rugs_textiles','artwork'].includes(e)).length || 0) >= 2 && !a.fixed_elements?.includes('none'),
  },
  n_theme_keepers: {
    id: 'n_theme_keepers',
    field: 'theme',
    text: 'Any theme or existing pieces?',
    type: 'text',
    priority: 'P1',
    condition: a => a.room_type === 'nursery' || a.room_type === 'bedroom_kid',
  },
  h_flow_targets: {
    id: 'h_flow_targets',
    field: 'flow_targets',
    text: 'Which adjacent spaces should this coordinate with?',
    type: 'multi',
    priority: 'P1',
    condition: a => a.room_type === 'hallway_entry',
  },
  h_adjacent_color: {
    id: 'h_adjacent_color',
    field: 'adjacent_primary_color',
    text: 'Primary color of adjacent space?',
    type: 'chipText',
    priority: 'P3',
    condition: a => a.room_type === 'hallway_entry' && !!(a.flow_targets && a.flow_targets.length > 0),
  },
  o_anchors_keep: {
    id: 'o_anchors_keep',
    field: 'anchors_keep',
    text: 'Is there a non-paint visual anchor we should respect?',
    type: 'multi',
    options: ['dark_floor','stone','metal','large_sofa_rug','none'],
    priority: 'P1',
    condition: a => a.room_type === 'open_concept',
  },
  o_coordination_preference: {
    id: 'o_coordination_preference',
    field: null,
    text: 'One cohesive palette vs subtle zone shifts?',
    type: 'single',
    options: ['One cohesive','Subtle zone shifts','Not sure'],
    priority: 'P4',
    condition: a => a.room_type === 'open_concept',
  },
  constraints: {
    id: 'constraints',
    field: 'constraints',
    text: 'Any special considerations?',
    type: 'multi',
    options: ['kids_pets','renting','hoa','low_voc','color_rules','budget','none'],
    priority: 'P2',
    required: true,
  },
  avoid_colors: {
    id: 'avoid_colors',
    field: 'avoid_colors',
    text: 'What colors should we avoid?',
    type: 'chipText',
    priority: 'P3',
    condition: a => a.constraints?.includes('color_rules') || false,
  },
};

export function getQuestionPriority(id: string): Priority {
  return QUESTIONS[id as QuestionId]?.priority || 'P4';
}
