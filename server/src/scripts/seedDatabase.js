require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');

const sampleArticles = [
  {
    title: "Effects of Microgravity on Plant Growth and Development in Space",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
    year: 2023,
    topic: "Plant Biology",
    abstract: "This comprehensive study investigates the profound effects of microgravity environments on plant growth patterns, cellular development, and physiological processes. Our research conducted aboard the International Space Station reveals significant alterations in root gravitropism, leaf morphology, and cellular structure when compared to terrestrial controls. The findings suggest that plants develop unique adaptive mechanisms to thrive in zero-gravity conditions, including modified water transport systems and altered gene expression patterns related to structural support.",
    aiSummary: "Plants in space grow differently than on Earth, developing unique survival strategies like modified water systems and altered support structures. This research helps us understand how to grow food during long space missions.",
    tags: ["microgravity", "plant biology", "ISS", "agriculture"],
    journal: "Space Biology Research Journal",
    volume: "45",
    issue: "3",
    pages: "123-145",
    doi: "10.1000/space-bio-2023-001",
    keywords: ["microgravity", "plant growth", "space agriculture", "gravitropism"],
    methodology: "Controlled experiments conducted on the International Space Station with Arabidopsis thaliana and wheat varieties. Plants were grown in specialized growth chambers with controlled lighting and nutrient delivery systems.",
    results: "Significant changes in root architecture, with roots growing in multiple directions rather than following gravity. Leaf morphology showed increased surface area and altered stomatal density. Gene expression analysis revealed upregulation of stress response genes and downregulation of gravity-sensing genes.",
    conclusion: "Plants demonstrate remarkable adaptability to microgravity conditions, developing alternative growth strategies that could be harnessed for space agriculture. These findings are crucial for developing sustainable food production systems for long-duration space missions.",
    citations: 45,
    relevanceScore: 0.95
  },
  {
    title: "Radiation Effects on Human Cellular DNA During Extended Space Flight",
    authors: ["Dr. James Thompson", "Dr. Maria Gonzalez"],
    year: 2022,
    topic: "Human Biology",
    abstract: "Extended exposure to cosmic radiation presents one of the most significant challenges for human space exploration. This study examines DNA damage patterns in astronaut cells after missions lasting 6-12 months, revealing increased double-strand breaks and chromosomal aberrations. Our analysis of blood samples from 45 astronauts shows correlation between mission duration and genetic damage, though repair mechanisms remain largely functional. These findings are crucial for developing protective protocols for Mars missions.",
    aiSummary: "Space radiation damages astronaut DNA over time, but the body can still repair most of it. This research is essential for planning safe trips to Mars and protecting crew health.",
    tags: ["radiation", "DNA", "astronauts", "health"],
    journal: "Astronaut Health and Safety",
    volume: "38",
    issue: "2",
    pages: "67-89",
    doi: "10.1000/astro-health-2022-002",
    keywords: ["cosmic radiation", "DNA damage", "space flight", "genetic repair"],
    methodology: "Longitudinal study of 45 astronauts before, during, and after space missions. Blood samples were analyzed for DNA damage markers, chromosomal aberrations, and repair enzyme activity.",
    results: "Average increase of 2.3-fold in double-strand breaks after 6-month missions. Chromosomal aberrations increased by 1.8-fold. DNA repair mechanisms remained 85% functional, with some individual variation.",
    conclusion: "While cosmic radiation causes measurable DNA damage, human repair systems remain largely effective. Individual monitoring and protective measures are essential for long-duration missions.",
    citations: 78,
    relevanceScore: 0.92
  },
  {
    title: "Microbial Communities in Closed-Loop Life Support Systems",
    authors: ["Dr. Amanda Foster", "Dr. Robert Kim", "Dr. Jennifer Liu"],
    year: 2023,
    topic: "Microbiology",
    abstract: "Understanding microbial ecology in spacecraft environments is critical for maintaining crew health and system functionality. This research characterizes bacterial and fungal communities within closed-loop life support systems, identifying both beneficial and potentially harmful species. Our metagenomic analysis reveals dynamic community structures that respond to environmental stressors and crew activities. Key findings include the emergence of antibiotic-resistant strains and the role of beneficial microbes in waste processing.",
    aiSummary: "Spacecraft develop their own unique microbial ecosystems that can both help and harm crew members. Managing these tiny communities is crucial for safe long-term space travel.",
    tags: ["microbiology", "life support", "spacecraft", "health"],
    journal: "Space Microbiology Quarterly",
    volume: "12",
    issue: "4",
    pages: "201-225",
    doi: "10.1000/space-micro-2023-003",
    keywords: ["microbial ecology", "closed-loop systems", "antibiotic resistance", "waste processing"],
    methodology: "Metagenomic analysis of air, water, and surface samples from ISS life support systems over 18 months. Samples were collected weekly and analyzed using 16S rRNA and ITS sequencing.",
    results: "Identified 247 bacterial species and 89 fungal species. Beneficial microbes dominated waste processing systems, while potential pathogens were found in air circulation systems. Antibiotic resistance genes increased by 15% over the study period.",
    conclusion: "Microbial communities in space environments require careful monitoring and management. Beneficial species should be encouraged while potential pathogens are controlled through environmental management.",
    citations: 34,
    relevanceScore: 0.88
  },
  {
    title: "Bone Density Loss Prevention Through Exercise in Microgravity",
    authors: ["Dr. Kevin Park", "Dr. Rachel Adams"],
    year: 2022,
    topic: "Exercise Physiology",
    abstract: "Astronauts experience rapid bone density loss in microgravity, with rates reaching 1-2% per month. This longitudinal study evaluates the effectiveness of various exercise protocols in mitigating bone loss during 6-month ISS missions. Results demonstrate that high-intensity resistance training combined with bisphosphonate treatment reduces bone loss by up to 60%. The research provides evidence-based recommendations for exercise prescriptions during long-duration spaceflight.",
    aiSummary: "Astronauts lose bone strength quickly in space, but the right exercise and medication can significantly reduce this loss. This helps keep crew members healthy for long missions.",
    tags: ["bone density", "exercise", "microgravity", "health"],
    journal: "Space Exercise Science",
    volume: "29",
    issue: "1",
    pages: "45-67",
    doi: "10.1000/space-exercise-2022-004",
    keywords: ["bone loss", "resistance training", "bisphosphonates", "space exercise"],
    methodology: "Randomized controlled trial with 24 astronauts on 6-month ISS missions. Participants were assigned to different exercise protocols with or without bisphosphonate treatment. Bone density was measured monthly using DEXA scans.",
    results: "Control group lost 1.8% bone density per month. Exercise-only group lost 1.1% per month. Exercise plus bisphosphonate group lost only 0.7% per month, representing a 60% reduction in bone loss.",
    conclusion: "Combined exercise and pharmaceutical interventions are highly effective in preventing bone loss during spaceflight. These protocols should be standard for all long-duration missions.",
    citations: 92,
    relevanceScore: 0.94
  },
  {
    title: "Psychological Adaptation Strategies for Long-Duration Space Missions",
    authors: ["Dr. Emily Watson", "Dr. David Martinez"],
    year: 2023,
    topic: "Psychology",
    abstract: "The psychological challenges of long-duration spaceflight include isolation, confinement, and separation from Earth. This study analyzes psychological adaptation patterns among crew members during simulated Mars missions lasting 520 days. Key findings include the importance of structured social activities, virtual reality Earth experiences, and personalized communication schedules with family. The research identifies critical intervention points and develops protocols for maintaining crew mental health during interplanetary travel.",
    aiSummary: "Long space missions are mentally challenging, but structured activities, virtual Earth experiences, and regular family contact help astronauts stay psychologically healthy.",
    tags: ["psychology", "isolation", "Mars missions", "mental health"],
    journal: "Space Psychology Review",
    volume: "18",
    issue: "3",
    pages: "156-178",
    doi: "10.1000/space-psych-2023-005",
    keywords: ["psychological adaptation", "isolation", "virtual reality", "crew mental health"],
    methodology: "Longitudinal psychological assessment of 12 crew members during 520-day Mars simulation missions. Assessments included standardized psychological tests, behavioral observations, and physiological stress markers.",
    results: "Crew members with structured social activities showed 40% lower stress levels. Virtual reality Earth experiences reduced homesickness by 60%. Personalized family communication schedules improved overall psychological well-being by 35%.",
    conclusion: "Structured psychological support programs are essential for long-duration space missions. Early intervention and personalized approaches are most effective in maintaining crew mental health.",
    citations: 67,
    relevanceScore: 0.91
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/space-biology-knowledge-engine';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Insert sample articles
    const articles = await Article.insertMany(sampleArticles);
    console.log(`Inserted ${articles.length} sample articles`);

    // Create connections between articles
    const articleIds = articles.map(article => article._id);
    
    // Update articles with connections
    await Article.findByIdAndUpdate(articles[0]._id, {
      connections: [articles[1]._id, articles[4]._id]
    });
    
    await Article.findByIdAndUpdate(articles[1]._id, {
      connections: [articles[0]._id, articles[3]._id]
    });
    
    await Article.findByIdAndUpdate(articles[2]._id, {
      connections: [articles[3]._id, articles[4]._id]
    });
    
    await Article.findByIdAndUpdate(articles[3]._id, {
      connections: [articles[1]._id, articles[2]._id]
    });
    
    await Article.findByIdAndUpdate(articles[4]._id, {
      connections: [articles[0]._id, articles[2]._id]
    });

    console.log('Created article connections');
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
