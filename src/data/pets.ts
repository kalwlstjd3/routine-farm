export type GrowthStage = 'initial' | 'growing' | 'juvenile' | 'adult' | 'hungry' | 'fainted';

export interface PetStageInfo {
  emoji: string;
  label: string;
  bg: string;
}

export interface PetDefinition {
  id: string;
  name: string;
  startType: 'egg' | 'baby';
  stages: Record<GrowthStage, PetStageInfo>;
}

export const PETS: PetDefinition[] = [
  // ── 알/부화 시작 4종 ──────────────────────────────────────────
  {
    id: 'chicken',
    name: '닭',
    startType: 'egg',
    stages: {
      initial:  { emoji: '🥚', label: '알',          bg: '#F5F5F5' },
      growing:  { emoji: '🐣', label: '부화중',      bg: '#FFF9E6' },
      juvenile: { emoji: '🐥', label: '병아리',      bg: '#FFFDE7' },
      adult:    { emoji: '🐔', label: '닭',           bg: '#FFF3E0' },
      hungry:   { emoji: '😢', label: '배고파요',    bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',        bg: '#F5F5F5' },
    },
  },
  {
    id: 'turtle',
    name: '거북이',
    startType: 'egg',
    stages: {
      initial:  { emoji: '🥚', label: '알',            bg: '#F5F5F5' },
      growing:  { emoji: '🐣', label: '부화중',        bg: '#E8F5E9' },
      juvenile: { emoji: '🐢', label: '아기 거북이',   bg: '#E0F2F1' },
      adult:    { emoji: '🐢', label: '거북이',         bg: '#C8E6C9' },
      hungry:   { emoji: '😢', label: '배고파요',      bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',          bg: '#F5F5F5' },
    },
  },
  {
    id: 'parrot',
    name: '앵무새',
    startType: 'egg',
    stages: {
      initial:  { emoji: '🥚', label: '알',            bg: '#F5F5F5' },
      growing:  { emoji: '🐣', label: '부화중',        bg: '#F3E5F5' },
      juvenile: { emoji: '🐦', label: '아기 앵무새',   bg: '#EDE7F6' },
      adult:    { emoji: '🦜', label: '앵무새',         bg: '#E8EAF6' },
      hungry:   { emoji: '😢', label: '배고파요',      bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',          bg: '#F5F5F5' },
    },
  },
  {
    id: 'duck',
    name: '오리',
    startType: 'egg',
    stages: {
      initial:  { emoji: '🥚', label: '알',          bg: '#F5F5F5' },
      growing:  { emoji: '🐣', label: '부화중',      bg: '#FFF8E1' },
      juvenile: { emoji: '🐤', label: '아기 오리',   bg: '#FFF9C4' },
      adult:    { emoji: '🦆', label: '오리',         bg: '#F9FBE7' },
      hungry:   { emoji: '😢', label: '배고파요',    bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',        bg: '#F5F5F5' },
    },
  },

  // ── 아기부터 시작 6종 ──────────────────────────────────────────
  {
    id: 'cat_scottish',
    name: '고양이 (스코티시폴드)',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐱', label: '아기 고양이',   bg: '#FFF3E0' },
      growing:  { emoji: '😺', label: '고양이',         bg: '#FFE0B2' },
      juvenile: { emoji: '😸', label: '고양이',         bg: '#FFCC80' },
      adult:    { emoji: '😻', label: '고양이',         bg: '#FFB74D' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
  {
    id: 'cat_russian',
    name: '고양이 (러시안블루)',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐱', label: '아기 고양이',   bg: '#E3F2FD' },
      growing:  { emoji: '😺', label: '고양이',         bg: '#BBDEFB' },
      juvenile: { emoji: '😸', label: '고양이',         bg: '#90CAF9' },
      adult:    { emoji: '😻', label: '고양이',         bg: '#64B5F6' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
  {
    id: 'dog_pomeranian',
    name: '강아지 (포메라니안)',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐶', label: '아기 강아지',   bg: '#FFF8E1' },
      growing:  { emoji: '🐕', label: '강아지',         bg: '#FFECB3' },
      juvenile: { emoji: '🐩', label: '강아지',         bg: '#FFE082' },
      adult:    { emoji: '🐩', label: '강아지',         bg: '#FFD54F' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
  {
    id: 'dog_golden',
    name: '강아지 (골든리트리버)',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐶', label: '아기 강아지',   bg: '#FFF3E0' },
      growing:  { emoji: '🐕', label: '강아지',         bg: '#FFE0B2' },
      juvenile: { emoji: '🦮', label: '강아지',         bg: '#FFCC80' },
      adult:    { emoji: '🦮', label: '강아지',         bg: '#FFA726' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
  {
    id: 'dog_shiba',
    name: '강아지 (시바이누)',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐶', label: '아기 강아지',   bg: '#FBE9E7' },
      growing:  { emoji: '🐕', label: '강아지',         bg: '#FFCCBC' },
      juvenile: { emoji: '🐕', label: '강아지',         bg: '#FFAB91' },
      adult:    { emoji: '🐕', label: '강아지',         bg: '#FF8A65' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
  {
    id: 'hamster',
    name: '햄스터',
    startType: 'baby',
    stages: {
      initial:  { emoji: '🐹', label: '아기 햄스터',   bg: '#FCE4EC' },
      growing:  { emoji: '🐹', label: '햄스터',         bg: '#F8BBD0' },
      juvenile: { emoji: '🐹', label: '햄스터',         bg: '#F48FB1' },
      adult:    { emoji: '🐭', label: '햄스터',         bg: '#F06292' },
      hungry:   { emoji: '😢', label: '배고파요',        bg: '#FFF0F0' },
      fainted:  { emoji: '😵', label: '기절',            bg: '#F5F5F5' },
    },
  },
];

export function getPet(id: string): PetDefinition | undefined {
  return PETS.find((p) => p.id === id);
}

export function getRandomPet(): PetDefinition {
  return PETS[Math.floor(Math.random() * PETS.length)];
}

export function getPetStageInfo(petId: string | null, stage: GrowthStage): PetStageInfo {
  const fallback: PetStageInfo = { emoji: '🥚', label: '알', bg: '#F5F5F5' };
  if (petId == null) return fallback;
  const pet = getPet(petId);
  if (pet == null) return fallback;
  return pet.stages[stage];
}
