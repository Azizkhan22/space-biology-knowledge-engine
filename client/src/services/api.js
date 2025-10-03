// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Import askAI function for testing
import { askAI } from './aiChat.js';

// Simulate network delay for development
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// API service class
export class ApiService {
  // Get suggested articles (for normal state)
  static async getSuggestedArticles() {
    try {
      // Simulate API call
      await simulateDelay();

      // In real implementation, this would be:
      // const response = await fetch(`${API_BASE_URL}/articles/suggested`);
      // return response.json();

      // Return dummy suggested articles
      return {
        success: true,
        data: [
          {
            id: 'suggested-1',
            title: "Latest Advances in Space Biology Research",
            authors: ["Dr. Elena Vasquez", "Dr. John Smith"],
            year: 2024,
            topic: "Space Biology",
            abstract: "Recent breakthroughs in understanding how biological systems adapt to space environments, with implications for long-duration missions.",
            aiSummary: "New research reveals how life adapts to space, helping prepare for future Mars missions.",
            tags: ["space biology", "adaptation", "Mars missions"],
            connections: ['suggested-2', 'suggested-3'],
            relevanceScore: 0.95
          },
          {
            id: 'suggested-2',
            title: "Microgravity Effects on Cellular Regeneration",
            authors: ["Dr. Sarah Kim", "Dr. Michael Chen"],
            year: 2024,
            topic: "Cell Biology",
            abstract: "Investigation of how microgravity environments affect cellular repair mechanisms and tissue regeneration processes.",
            aiSummary: "Space conditions change how our cells heal and regenerate, which is important for astronaut health.",
            tags: ["microgravity", "cells", "regeneration"],
            connections: ['suggested-1', 'suggested-4'],
            relevanceScore: 0.89
          },
          {
            id: 'suggested-3',
            title: "Psychological Resilience in Isolated Environments",
            authors: ["Dr. Maria Rodriguez", "Dr. David Park"],
            year: 2024,
            topic: "Psychology",
            abstract: "Study of mental health strategies and resilience factors for crew members in long-duration space missions.",
            aiSummary: "Research on keeping astronauts mentally healthy during long space journeys through proven strategies.",
            tags: ["psychology", "resilience", "isolation"],
            connections: ['suggested-1', 'suggested-5'],
            relevanceScore: 0.87
          },
          {
            id: 'suggested-4',
            title: "Advanced Life Support Systems for Deep Space",
            authors: ["Dr. Robert Johnson", "Dr. Lisa Wang"],
            year: 2024,
            topic: "Engineering",
            abstract: "Development of next-generation life support technologies for sustainable long-term space habitation.",
            aiSummary: "New life support systems that can keep astronauts alive and healthy on very long space missions.",
            tags: ["life support", "engineering", "sustainability"],
            connections: ['suggested-2', 'suggested-6'],
            relevanceScore: 0.84
          },
          {
            id: 'suggested-5',
            title: "Nutritional Requirements for Space Travel",
            authors: ["Dr. Jennifer Liu", "Dr. Carlos Martinez"],
            year: 2024,
            topic: "Nutrition",
            abstract: "Comprehensive analysis of nutritional needs and dietary strategies for maintaining health during extended space missions.",
            aiSummary: "Understanding what astronauts need to eat to stay healthy during long trips to other planets.",
            tags: ["nutrition", "health", "space food"],
            connections: ['suggested-3', 'suggested-1'],
            relevanceScore: 0.82
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching suggested articles:', error);
      return { success: false, error: error.message };
    }
  }

  // Search articles based on query
  static async searchArticles(query, filters = {}) {
    try {
      await simulateDelay(1000);

      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}/articles/search`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query, filters })
      // });
      // return response.json();

      // Simulate search results based on query
      const searchResults = [
        {
          id: `search-${Date.now()}-1`,
          title: `${query} Research in Microgravity Environments`,
          authors: ["Dr. Search Result", "Dr. API Response"],
          year: 2024,
          topic: "Search Results",
          abstract: `Comprehensive study of ${query} and its implications for space research. This paper examines the effects of microgravity on ${query} and provides insights for future space missions.`,
          aiSummary: `Research findings about ${query} in space environments, with practical applications for astronauts.`,
          tags: [query.toLowerCase(), "search", "microgravity", "space"],
          connections: [`search-${Date.now()}-2`],
          relevanceScore: 0.92
        },
        {
          id: `search-${Date.now()}-2`,
          title: `Advanced ${query} Applications for Deep Space Missions`,
          authors: ["Dr. Query Researcher", "Dr. Space Scientist"],
          year: 2024,
          topic: "Applied Research",
          abstract: `Investigation of advanced applications of ${query} in the context of long-duration space missions and planetary exploration.`,
          aiSummary: `How ${query} can be applied to make space missions safer and more successful.`,
          tags: [query.toLowerCase(), "applications", "deep space", "missions"],
          connections: [`search-${Date.now()}-1`],
          relevanceScore: 0.88
        },
        {
          id: `search-${Date.now()}-3`,
          title: `${query} Protocols for International Space Station`,
          authors: ["Dr. ISS Researcher", "Dr. Protocol Developer"],
          year: 2023,
          topic: "Space Operations",
          abstract: `Development and implementation of ${query}-related protocols for International Space Station operations and crew safety.`,
          aiSummary: `Safety and operational procedures related to ${query} for astronauts working on the space station.`,
          tags: [query.toLowerCase(), "ISS", "protocols", "safety"],
          connections: [`search-${Date.now()}-1`],
          relevanceScore: 0.85
        }
      ];

      return {
        success: true,
        data: searchResults,
        query: query,
        totalResults: searchResults.length
      };
    } catch (error) {
      console.error('Error searching articles:', error);
      return { success: false, error: error.message };
    }
  }

  // Get knowledge graph entities and relations
  static async getKnowledgeGraph() {
    try {
      await simulateDelay(600);

      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}/knowledge-graph`);
      // return response.json();

      return {
        success: true,
        data: {
          entities: [
            { id: '1', label: 'Microgravity Research', category: 'physics', size: 45, articleCount: 23 },
            { id: '2', label: 'Human Health', category: 'health', size: 50, articleCount: 31 },
            { id: '3', label: 'Plant Biology', category: 'biology', size: 38, articleCount: 18 },
            { id: '4', label: 'Psychological Adaptation', category: 'psychology', size: 35, articleCount: 15 },
            { id: '5', label: 'Radiation Effects', category: 'physics', size: 32, articleCount: 12 },
            { id: '6', label: 'Life Support Systems', category: 'engineering', size: 40, articleCount: 20 },
            { id: '7', label: 'Bone & Muscle Health', category: 'health', size: 30, articleCount: 14 },
            { id: '8', label: 'Sleep & Circadian', category: 'health', size: 28, articleCount: 11 },
            { id: '9', label: 'Microbiology', category: 'biology', size: 33, articleCount: 16 },
            { id: '10', label: 'Drug Development', category: 'medicine', size: 25, articleCount: 8 },
            { id: '11', label: 'Mars Mission Prep', category: 'space', size: 42, articleCount: 25 },
            { id: '12', label: 'ISS Experiments', category: 'space', size: 48, articleCount: 35 },
            { id: '13', label: 'Protein Research', category: 'biochemistry', size: 27, articleCount: 9 },
            { id: '14', label: 'Exercise Protocols', category: 'health', size: 29, articleCount: 13 },
            { id: '15', label: 'DNA & Genetics', category: 'genetics', size: 31, articleCount: 17 }
          ],
          relations: [
            { id: 'r1', source: '1', target: '2', strength: 0.9, type: 'affects' },
            { id: 'r2', source: '1', target: '3', strength: 0.8, type: 'influences' },
            { id: 'r3', source: '2', target: '7', strength: 0.9, type: 'includes' },
            { id: 'r4', source: '2', target: '8', strength: 0.7, type: 'relates_to' },
            { id: 'r5', source: '4', target: '11', strength: 0.8, type: 'critical_for' },
            { id: 'r6', source: '5', target: '15', strength: 0.9, type: 'causes' },
            { id: 'r7', source: '6', target: '9', strength: 0.7, type: 'contains' },
            { id: 'r8', source: '12', target: '1', strength: 0.9, type: 'studies' },
            { id: 'r9', source: '12', target: '3', strength: 0.8, type: 'studies' },
            { id: 'r10', source: '12', target: '10', strength: 0.6, type: 'enables' },
            { id: 'r11', source: '11', target: '4', strength: 0.8, type: 'requires' },
            { id: 'r12', source: '11', target: '6', strength: 0.9, type: 'needs' },
            { id: 'r13', source: '14', target: '7', strength: 0.9, type: 'maintains' },
            { id: 'r14', source: '13', target: '10', strength: 0.8, type: 'supports' },
            { id: 'r15', source: '9', target: '2', strength: 0.6, type: 'impacts' }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      return { success: false, error: error.message };
    }
  }

  // Get articles related to a specific entity/topic
  static async getArticlesByEntity(entityId, entityLabel) {
    try {
      await simulateDelay(700);

      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}/articles/by-entity/${entityId}`);
      // return response.json();

      // Generate articles related to the selected entity
      const relatedArticles = [
        {
          id: `entity-${entityId}-1`,
          title: `${entityLabel} in Space: Latest Research Findings`,
          authors: ["Dr. Entity Researcher", "Dr. Topic Specialist"],
          year: 2024,
          topic: entityLabel,
          abstract: `Comprehensive analysis of ${entityLabel} research conducted in space environments. This study examines recent findings and their implications for future space exploration missions.`,
          aiSummary: `Latest discoveries about ${entityLabel} in space and what they mean for astronauts and future missions.`,
          tags: [entityLabel.toLowerCase().replace(/\s+/g, '-'), "space research", "recent findings"],
          connections: [`entity-${entityId}-2`, `entity-${entityId}-3`],
          relevanceScore: 0.95
        },
        {
          id: `entity-${entityId}-2`,
          title: `${entityLabel} Protocols for Long-Duration Missions`,
          authors: ["Dr. Protocol Developer", "Dr. Mission Planner"],
          year: 2024,
          topic: "Mission Planning",
          abstract: `Development of standardized protocols and procedures related to ${entityLabel} for long-duration space missions including Mars exploration.`,
          aiSummary: `Guidelines and procedures for managing ${entityLabel} during long space missions.`,
          tags: [entityLabel.toLowerCase().replace(/\s+/g, '-'), "protocols", "long-duration"],
          connections: [`entity-${entityId}-1`, `entity-${entityId}-3`],
          relevanceScore: 0.91
        },
        {
          id: `entity-${entityId}-3`,
          title: `Future Directions in ${entityLabel} Research`,
          authors: ["Dr. Future Vision", "Dr. Research Director"],
          year: 2024,
          topic: "Future Research",
          abstract: `Exploration of future research directions and emerging technologies in ${entityLabel} with focus on next-generation space exploration capabilities.`,
          aiSummary: `Where ${entityLabel} research is heading and new technologies being developed.`,
          tags: [entityLabel.toLowerCase().replace(/\s+/g, '-'), "future research", "emerging tech"],
          connections: [`entity-${entityId}-1`, `entity-${entityId}-2`],
          relevanceScore: 0.87
        }
      ];

      return {
        success: true,
        data: relatedArticles,
        entity: { id: entityId, label: entityLabel },
        totalResults: relatedArticles.length
      };
    } catch (error) {
      console.error('Error fetching articles by entity:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate AI summary for an article
  static async generateAISummary(articleId, articleData) {
    try {
      await simulateDelay(2000);

      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}/ai/summary`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ articleId, articleData })
      // });
      // return response.json();

      // For testing: Use the askAI module to generate summary
      const context = `
Title: ${articleData.title}
Authors: ${articleData.authors?.join(', ') || 'Unknown'}
Year: ${articleData.year || 'Unknown'}
Abstract: ${articleData.abstract || 'No abstract available'}
Tags: ${articleData.tags?.join(', ') || 'No tags'}
      `;

      const question = "Please provide a comprehensive summary of this research paper, highlighting the main findings, methodology, and implications for space research.";

      const summary = await askAI(context, question);

      return {
        success: true,
        data: {
          articleId: articleId,
          summary: summary,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return { success: false, error: error.message };
    }
  }

  // Ask AI questions about an article
  static async askAIQuestion(articleId, question, articleData = null) {
    try {
      await simulateDelay(1500);

      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ articleId, question, articleData })
      // });
      // return response.json();

      // For testing: Use the askAI module
      let context;

      if (articleData) {
        // Use real article data if provided
        context = `
Title: ${articleData.title}
Authors: ${articleData.authors?.join(', ') || 'Unknown'}
Year: ${articleData.year || 'Unknown'}
Abstract: ${articleData.abstract || 'No abstract available'}
AI Summary: ${articleData.aiSummary || 'No summary available'}
Tags: ${articleData.tags?.join(', ') || 'No tags'}
        `;
      } else {
        // Fallback to generic context
        context = `
This is a research paper about space biology and related topics.
The paper discusses various aspects of biological systems in space environments.
It covers topics such as microgravity effects, human health in space, and space research methodologies.
The research has implications for long-duration space missions and astronaut health.
        `;
      }

      const answer = await askAI(context, question);

      return {
        success: true,
        data: {
          question: question,
          answer: answer,
          confidence: 0.8, // Default confidence for askAI module
          sources: [`Article ID: ${articleId}`, "NASA Space Biology Database", "International Space Station Research"],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error asking AI question:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ApiService;
