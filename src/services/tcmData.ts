// ===============================
// TCM SINDROM MASTER - FULL DATA CORE
// ===============================

export interface Syndrome {
  name: string;
  category?: string;
  symptoms: string[];
  points: string[];
  technique: string;
}

export const syndromeDB: Syndrome[] = [
  {
    name: "SP Qi Deficiency",
    category: "Zang Fu",
    symptoms: ["lelah", "kembung", "nafsu makan rendah", "feses lembek", "lemas"],
    points: ["ST36", "SP6", "BL20", "CV12"],
    technique: "Tonifikasi"
  },
  {
    name: "Kidney Yin Deficiency",
    category: "Zang Fu",
    symptoms: ["panas malam", "kering", "tinnitus", "nyeri pinggang", "pusing"],
    points: ["KI3", "SP6", "LV8", "KI6"],
    technique: "Tonifikasi Yin"
  },
  {
    name: "Liver Qi Stagnation",
    category: "Zang Fu",
    symptoms: ["emosi", "nyeri dada", "stres", "mudah marah", "distensi abdomen"],
    points: ["LV3", "LI4", "GB34", "LV14"],
    technique: "Regulasi Qi"
  },
  {
    name: "Heart Blood Deficiency",
    category: "Zang Fu",
    symptoms: ["insomnia", "cemas", "palpitasi", "pelupa", "wajah pucat"],
    points: ["HT7", "SP6", "BL15", "CV14"],
    technique: "Tonifikasi"
  },
  {
    name: "Lung Qi Deficiency",
    category: "Zang Fu",
    symptoms: ["batuk", "lemah", "napas pendek", "suara rendah", "mudah berkeringat"],
    points: ["LU9", "ST36", "BL13", "LU7"],
    technique: "Tonifikasi"
  }
];

export const acupuncturePoints: Record<string, { name: string; function: string; location: string }> = {
  ST36: {
    name: "Zusanli",
    function: "Tonify Qi & Blood, Strengthen Spleen & Stomach",
    location: "3 cun below ST35, one finger-width lateral to the anterior crest of the tibia"
  },
  SP6: {
    name: "Sanyinjiao",
    function: "Tonify Yin, Blood, and Qi; Regulate Liver, Spleen, and Kidney",
    location: "3 cun directly above the tip of the medial malleolus"
  },
  LV3: {
    name: "Taichong",
    function: "Regulate Liver Qi, Subdue Liver Yang, Clear Heat",
    location: "On the dorsum of the foot, in the hollow distal to the junction of the 1st and 2nd metatarsal bones"
  },
  LI4: {
    name: "Hegu",
    function: "Expel Wind, Regulate Qi, Relieve Pain",
    location: "On the dorsum of the hand, between the 1st and 2nd metatarsal bones"
  },
  KI3: {
    name: "Taixi",
    function: "Tonify Kidney Yin and Yang, Clear Heat",
    location: "In the hollow between the tip of the medial malleolus and the Achilles tendon"
  },
  HT7: {
    name: "Shenmen",
    function: "Calm the Mind, Nourish Heart Blood",
    location: "At the ulnar end of the transverse crease of the wrist"
  },
  LU9: {
    name: "Taiyuan",
    function: "Tonify Lung Qi and Yin, Resolve Phlegm",
    location: "At the radial end of the transverse crease of the wrist"
  }
};

export const wuxing = [
  { element: "Wood", organ: "Liver", emotion: "Anger", color: "Green" },
  { element: "Fire", organ: "Heart", emotion: "Joy", color: "Red" },
  { element: "Earth", organ: "Spleen", emotion: "Worry", color: "Yellow" },
  { element: "Metal", organ: "Lung", emotion: "Sadness", color: "White" },
  { element: "Water", organ: "Kidney", emotion: "Fear", color: "Black" }
];

export const needlingTechniques = {
  tonification: {
    method: "Masuk perlahan, tarik cepat",
    angle: "30-90°",
    use: "Defisiensi"
  },
  sedation: {
    method: "Masuk cepat, tarik perlahan",
    angle: "45-90°",
    use: "Ekses"
  }
};

// ===============================
// 5. DIAGNOSIS DARI INPUT USER
// ===============================
export function diagnoseFromSymptoms(input: string): Syndrome | undefined {
  const lowerInput = input.toLowerCase();
  return syndromeDB.find(s =>
    s.symptoms.some(sym => lowerInput.includes(sym.toLowerCase()))
  );
}

// ===============================
// 6. ANALISA FOTO LIDAH (SIMULASI)
// ===============================
export function analyzeTongue(imageFile?: File) {
  // Simulasi hasil
  return {
    color: "Merah",
    coating: "Tipis",
    result: "Yin Deficiency",
    confidence: 88
  };
}

// ===============================
// 7. CHAT SIMPLE (USER TANYA)
// ===============================
export function askDiagnosis(question: string): string {
  const result = diagnoseFromSymptoms(question);

  if (!result) return "Gejala tidak cukup jelas untuk diagnosa cepat. Silakan gunakan Smart AI Analysis.";

  return `Kemungkinan sindrom: ${result.name}. Titik yang disarankan: ${result.points.join(", ")}.`;
}
