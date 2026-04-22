// Knowledge base (ubah data di sini)

// Prior probability
export const PRIOR_PROBABILITY = {
  H1: 0.8203,  // Dengue Mono-infection
  H2: 0.0391,  // Koinfeksi Tifoid
  H3: 0.0293   // Koinfeksi Malaria
};

// Hipotesis
export const HYPOTHESIS_NAMES = {
  H1: 'Mono-Dengue',
  H2: 'Koinfeksi Tifoid',
  H3: 'Koinfeksi Malaria'
};

// Label hipotesis (UI)
export const HYPOTHESIS_DISPLAY = {
  H1: 'Mono-Dengue (H1)',
  H2: 'Koinfeksi Tifoid (H2)',
  H3: 'Koinfeksi Malaria (H3)'
};

// Grup parameter (UI)
export const CLINICAL_GROUP_DEFS = [
  { key: 'symptoms', label: 'Symptoms (Gejala Subjektif)', min: 1, max: 11 },
  { key: 'signs', label: 'Signs (Tanda Fisik/Pemeriksaan)', min: 12, max: 999 }
];

// Nama EN (opsional)
export const SYMPTOMS_EN = {
  G01: 'Fever',
  G02: 'Myalgia',
  G03: 'Arthralgia',
  G04: 'Pain abdomen',
  G05: 'Loose stools',
  G06: 'Vomiting',
  G07: 'Breathlessness',
  G08: 'Cough',
  G09: 'Bleeding manifestation',
  G10: 'Weakness of lower limb',
  G11: 'Decrease urine output',
  G12: 'Icterus',
  G13: 'Bradycardia',
  G14: 'Hepatomegaly',
  G15: 'Splenomegaly',
  G16: 'Rash',
  G17: 'Hypotension',
  G18: 'Skin bleed',
  G19: 'Mucosal bleed',
  G20: 'Calf/thigh muscle tenderness',
  G21: 'Muscle tenderness',
  G22: 'Delayed reflexes',
  G23: 'AKI (Acute Kidney Injury)'
};

// Override tampilan likelihood (UI)
export const LIKELIHOOD_DISPLAY_OVERRIDE = {
  G09: [null, 0, null],
  G18: [null, 0, null],
  G19: [null, 0, null]
};

// Gejala
export const SYMPTOMS = {
  G01: 'Demam',
  G02: 'Nyeri Otot',
  G03: 'Nyeri Sendi',
  G04: 'Nyeri Perut',
  G05: 'Diare',
  G06: 'Muntah',
  G07: 'Sesak Napas',
  G08: 'Batuk',
  G09: 'Perdarahan',
  G10: 'Kelemahan Kaki',
  G11: 'Penurunan Urin',
  G12: 'Sakit Kuning',
  G13: 'Nadi Lambat',
  G14: 'Pembesaran Hati',
  G15: 'Pembesaran Limpa',
  G16: 'Ruam',
  G17: 'Tekanan Darah Rendah',
  G18: 'Perdarahan Kulit',
  G19: 'Perdarahan Mukosa',
  G20: 'Nyeri Tekan Kaki',
  G21: 'Nyeri Tekan Otot',
  G22: 'Refleks Melambat',
  G23: 'Gagal Ginjal Akut'
};

// Likelihood [H1,H2,H3]
export const LIKELIHOOD = {
  G01: [1.000, 1.000, 1.000],
  G02: [0.820, 0.450, 0.866],
  G03: [0.478, 0.250, 0.333],
  G04: [0.250, 0.900, 0.001],
  G05: [0.004, 0.700, 0.001],
  G06: [0.327, 0.450, 0.001],
  G07: [0.013, 0.001, 0.001],
  G08: [0.003, 0.100, 0.066],
  G09: [0.060, 0.001, 0.666],
  G10: [0.001, 0.001, 0.133],
  G11: [0.046, 0.001, 0.066],
  G12: [0.133, 0.133, 0.666],
  G13: [0.200, 0.500, 0.001],
  G14: [0.185, 0.500, 0.666],
  G15: [0.128, 0.150, 0.535],
  G16: [0.415, 0.001, 0.001],
  G17: [0.167, 0.500, 0.266],
  G18: [0.228, 0.001, 0.660],
  G19: [0.424, 0.001, 0.660],
  G20: [0.090, 0.001, 0.133],
  G21: [0.185, 0.001, 0.133],
  G22: [0.090, 0.001, 0.333],
  G23: [0.128, 0.001, 0.066]
};

// Rule-based
export const RULES = [
  {
    name: 'Dengue Mono-infection',
    required: ['G01', 'G03', 'G16'],
    excluded: ['G04'],
    description: 'Demam + Nyeri Sendi + Ruam (tanpa Nyeri Perut)'
  },
  {
    name: 'Koinfeksi Tifoid',
    required: ['G01', 'G04', 'G05'],
    excluded: [],
    description: 'Demam + Nyeri Perut + Diare'
  },
  {
    name: 'Koinfeksi Malaria',
    required: ['G01', 'G12', 'G15'],
    excluded: [],
    description: 'Demam + Sakit Kuning + Pembesaran Limpa'
  }
];