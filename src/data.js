export const SYMBOLS = [
  {
    id: 'sankofa',
    name: 'Sankofa',
    meaning: 'Return & retrieve',
    description: 'It is not wrong to go back for what you have forgotten.',
  },
  {
    id: 'nkonsonkonson',
    name: 'Nkonsonkonson',
    meaning: 'Linked together',
    description: 'A reminder of unity and the human bonds that hold us together.',
  },
  {
    id: 'akoma-ntoaso',
    name: 'Akoma Ntoaso',
    meaning: 'Linked hearts',
    description: 'Two hearts joined: agreement, partnership, and an enduring bond.',
  },
  {
    id: 'akoma',
    name: 'Akoma',
    meaning: 'The heart',
    description: 'Patience, love and the readiness to forgive: the seat of feeling.',
  },
  {
    id: 'gye-nyame',
    name: 'Gye Nyame',
    meaning: 'Except God',
    description: 'Awe at what is greater than us: the supremacy of the divine.',
  },
  {
    id: 'aya',
    name: 'Aya',
    meaning: 'The fern',
    description: 'Endurance and resourcefulness: I have grown through hard ground.',
  },
  {
    id: 'nsoroma',
    name: 'Nsoroma',
    meaning: 'Child of the heavens',
    description: 'A star: hope, and a light to steer by in the dark.',
  },
  {
    id: 'nkyinkyim',
    name: 'Nkyinkyim',
    meaning: 'The winding path',
    description: 'Life twists and turns: adaptability, devotion, and resilience.',
  },
];

export const BEADS = [
  { number: '01', symbolId: 'akoma' },
  { number: '02', symbolId: 'nkonsonkonson' },
  { number: '03', symbolId: 'sankofa' },
  { number: '04', symbolId: 'akoma-ntoaso' },
  { number: '05', symbolId: 'aya' },
  { number: '06', symbolId: 'nsoroma' },
];

export function findSymbol(id) {
  return SYMBOLS.find((symbol) => symbol.id === id) ?? SYMBOLS[3];
}
