// Mock data for NASA bioscience publications
export const mockPublications = [
  {
    id: 1,
    title: "Effects of Microgravity on Plant Growth and Development in Space",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
    year: 2023,
    topic: "Plant Biology",
    abstract: "This comprehensive study investigates the profound effects of microgravity environments on plant growth patterns, cellular development, and physiological processes. Our research conducted aboard the International Space Station reveals significant alterations in root gravitropism, leaf morphology, and cellular structure when compared to terrestrial controls. The findings suggest that plants develop unique adaptive mechanisms to thrive in zero-gravity conditions, including modified water transport systems and altered gene expression patterns related to structural support.",
    aiSummary: "Plants in space grow differently than on Earth, developing unique survival strategies like modified water systems and altered support structures. This research helps us understand how to grow food during long space missions.",
    tags: ["microgravity", "plant biology", "ISS", "agriculture"],
    connections: [2, 5, 12]
  },
  {
    id: 2,
    title: "Radiation Effects on Human Cellular DNA During Extended Space Flight",
    authors: ["Dr. James Thompson", "Dr. Maria Gonzalez"],
    year: 2022,
    topic: "Human Biology",
    abstract: "Extended exposure to cosmic radiation presents one of the most significant challenges for human space exploration. This study examines DNA damage patterns in astronaut cells after missions lasting 6-12 months, revealing increased double-strand breaks and chromosomal aberrations. Our analysis of blood samples from 45 astronauts shows correlation between mission duration and genetic damage, though repair mechanisms remain largely functional. These findings are crucial for developing protective protocols for Mars missions.",
    aiSummary: "Space radiation damages astronaut DNA over time, but the body can still repair most of it. This research is essential for planning safe trips to Mars and protecting crew health.",
    tags: ["radiation", "DNA", "astronauts", "health"],
    connections: [1, 8, 15]
  },
  {
    id: 3,
    title: "Microbial Communities in Closed-Loop Life Support Systems",
    authors: ["Dr. Amanda Foster", "Dr. Robert Kim", "Dr. Jennifer Liu"],
    year: 2023,
    topic: "Microbiology",
    abstract: "Understanding microbial ecology in spacecraft environments is critical for maintaining crew health and system functionality. This research characterizes bacterial and fungal communities within closed-loop life support systems, identifying both beneficial and potentially harmful species. Our metagenomic analysis reveals dynamic community structures that respond to environmental stressors and crew activities. Key findings include the emergence of antibiotic-resistant strains and the role of beneficial microbes in waste processing.",
    aiSummary: "Spacecraft develop their own unique microbial ecosystems that can both help and harm crew members. Managing these tiny communities is crucial for safe long-term space travel.",
    tags: ["microbiology", "life support", "spacecraft", "health"],
    connections: [4, 7, 11]
  },
  {
    id: 4,
    title: "Bone Density Loss Prevention Through Exercise in Microgravity",
    authors: ["Dr. Kevin Park", "Dr. Rachel Adams"],
    year: 2022,
    topic: "Exercise Physiology",
    abstract: "Astronauts experience rapid bone density loss in microgravity, with rates reaching 1-2% per month. This longitudinal study evaluates the effectiveness of various exercise protocols in mitigating bone loss during 6-month ISS missions. Results demonstrate that high-intensity resistance training combined with bisphosphonate treatment reduces bone loss by up to 60%. The research provides evidence-based recommendations for exercise prescriptions during long-duration spaceflight.",
    aiSummary: "Astronauts lose bone strength quickly in space, but the right exercise and medication can significantly reduce this loss. This helps keep crew members healthy for long missions.",
    tags: ["bone density", "exercise", "microgravity", "health"],
    connections: [2, 6, 9]
  },
  {
    id: 5,
    title: "Psychological Adaptation Strategies for Long-Duration Space Missions",
    authors: ["Dr. Emily Watson", "Dr. David Martinez"],
    year: 2023,
    topic: "Psychology",
    abstract: "The psychological challenges of long-duration spaceflight include isolation, confinement, and separation from Earth. This study analyzes psychological adaptation patterns among crew members during simulated Mars missions lasting 520 days. Key findings include the importance of structured social activities, virtual reality Earth experiences, and personalized communication schedules with family. The research identifies critical intervention points and develops protocols for maintaining crew mental health during interplanetary travel.",
    aiSummary: "Long space missions are mentally challenging, but structured activities, virtual Earth experiences, and regular family contact help astronauts stay psychologically healthy.",
    tags: ["psychology", "isolation", "Mars missions", "mental health"],
    connections: [1, 8, 13]
  },
  {
    id: 6,
    title: "Protein Crystallization in Microgravity for Drug Development",
    authors: ["Dr. Steven Lee", "Dr. Catherine Brown"],
    year: 2021,
    topic: "Biochemistry",
    abstract: "Microgravity environments offer unique advantages for protein crystallization, potentially leading to better drug development. This research compares protein crystal quality grown on Earth versus those grown on the ISS, focusing on medically relevant proteins including insulin and various enzymes. Results show that space-grown crystals exhibit superior structural organization and reduced defects, leading to more accurate molecular modeling and improved drug design possibilities.",
    aiSummary: "Growing protein crystals in space produces higher quality results than on Earth, which could lead to better medicines and drug development.",
    tags: ["protein crystallization", "drug development", "microgravity", "biochemistry"],
    connections: [4, 10, 14]
  },
  {
    id: 7,
    title: "Sleep Patterns and Circadian Rhythms in Space Environment",
    authors: ["Dr. Michelle Taylor", "Dr. Andrew Wilson"],
    year: 2022,
    topic: "Sleep Science",
    abstract: "The absence of natural day-night cycles in space significantly disrupts astronaut circadian rhythms and sleep quality. This comprehensive study monitors sleep patterns, melatonin levels, and cognitive performance in astronauts during 3-12 month missions. Findings reveal that artificial lighting protocols and melatonin supplementation can partially restore normal sleep cycles, though individual variations remain significant. The research provides guidelines for optimizing crew rest and alertness during critical mission phases.",
    aiSummary: "Astronauts struggle with sleep in space due to lack of day-night cycles, but artificial lighting and melatonin supplements can help restore more normal sleep patterns.",
    tags: ["sleep", "circadian rhythms", "lighting", "performance"],
    connections: [3, 5, 12]
  },
  {
    id: 8,
    title: "Cardiovascular Deconditioning and Countermeasures in Spaceflight",
    authors: ["Dr. Patricia Davis", "Dr. Mark Johnson"],
    year: 2023,
    topic: "Cardiovascular Health",
    abstract: "Prolonged exposure to microgravity leads to significant cardiovascular deconditioning, including reduced blood volume, orthostatic intolerance, and decreased cardiac muscle mass. This study evaluates the effectiveness of exercise countermeasures and pharmaceutical interventions in maintaining cardiovascular health during long-duration missions. Results demonstrate that combined aerobic and resistance exercise protocols, along with fluid loading before re-entry, significantly improve post-flight cardiovascular recovery.",
    aiSummary: "Space travel weakens the heart and blood vessels, but specific exercises and treatments can help maintain cardiovascular health during missions and improve recovery after returning to Earth.",
    tags: ["cardiovascular", "exercise", "deconditioning", "health"],
    connections: [2, 4, 5]
  }
];

export const mockGraphData = {
  nodes: [
    { id: '1', label: 'Plant Biology', category: 'biology', size: 30 },
    { id: '2', label: 'Human Health', category: 'health', size: 40 },
    { id: '3', label: 'Microgravity', category: 'physics', size: 35 },
    { id: '4', label: 'Exercise', category: 'health', size: 25 },
    { id: '5', label: 'Psychology', category: 'psychology', size: 30 },
    { id: '6', label: 'Radiation', category: 'physics', size: 28 },
    { id: '7', label: 'Microbiology', category: 'biology', size: 32 },
    { id: '8', label: 'Sleep', category: 'health', size: 26 },
    { id: '9', label: 'Bone Health', category: 'health', size: 24 },
    { id: '10', label: 'Drug Development', category: 'medicine', size: 22 },
    { id: '11', label: 'Life Support', category: 'engineering', size: 29 },
    { id: '12', label: 'ISS Research', category: 'space', size: 45 },
    { id: '13', label: 'Mars Missions', category: 'space', size: 38 },
    { id: '14', label: 'Protein Research', category: 'biochemistry', size: 27 },
    { id: '15', label: 'DNA Damage', category: 'genetics', size: 31 }
  ],
  edges: [
    { id: 'e1', source: '1', target: '3', weight: 0.8 },
    { id: 'e2', source: '2', target: '6', weight: 0.9 },
    { id: 'e3', source: '3', target: '4', weight: 0.7 },
    { id: 'e4', source: '5', target: '13', weight: 0.6 },
    { id: 'e5', source: '7', target: '11', weight: 0.8 },
    { id: 'e6', source: '8', target: '2', weight: 0.7 },
    { id: 'e7', source: '9', target: '4', weight: 0.9 },
    { id: 'e8', source: '10', target: '14', weight: 0.6 },
    { id: 'e9', source: '12', target: '1', weight: 0.8 },
    { id: 'e10', source: '12', target: '2', weight: 0.9 },
    { id: 'e11', source: '13', target: '2', weight: 0.7 },
    { id: 'e12', source: '15', target: '6', weight: 0.8 },
    { id: 'e13', source: '3', target: '9', weight: 0.6 },
    { id: 'e14', source: '7', target: '2', weight: 0.5 },
    { id: 'e15', source: '8', target: '5', weight: 0.4 }
  ]
};

export const categories = [
  { id: 'all', name: 'All Topics', color: 'cosmic-500' },
  { id: 'biology', name: 'Biology', color: 'green-500' },
  { id: 'health', name: 'Health', color: 'red-500' },
  { id: 'physics', name: 'Physics', color: 'blue-500' },
  { id: 'psychology', name: 'Psychology', color: 'purple-500' },
  { id: 'medicine', name: 'Medicine', color: 'pink-500' },
  { id: 'engineering', name: 'Engineering', color: 'orange-500' },
  { id: 'space', name: 'Space Operations', color: 'indigo-500' },
  { id: 'biochemistry', name: 'Biochemistry', color: 'teal-500' },
  { id: 'genetics', name: 'Genetics', color: 'yellow-500' }
];

export const years = [
  { id: 'all', name: 'All Years' },
  { id: '2023', name: '2023' },
  { id: '2022', name: '2022' },
  { id: '2021', name: '2021' },
  { id: '2020', name: '2020' },
  { id: '2019', name: '2019' }
];
