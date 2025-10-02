# NASA BioSpace Knowledge Engine

A clean and aesthetic React dynamic dashboard for exploring 608 NASA bioscience publications built for the NASA Space Apps Challenge.

## 🚀 Features

### Core Functionality
- **Smart Search**: Search through publications by title, abstract, authors, tags, and topics
- **Interactive Knowledge Graph**: Explore connections between research topics using Cytoscape.js
- **Detailed Paper View**: View abstracts, AI summaries, and metadata for each publication
- **Responsive Design**: Optimized for desktop and tablet devices

### User Interface
- **Space Theme**: Outer space aesthetic with animated stars, nebula backgrounds, and cosmic gradients
- **Glass Morphism**: Modern card-based design with soft shadows and glass effects
- **Dark Mode**: Space-themed dark interface with cosmic color palette
- **Smooth Animations**: Floating elements, twinkling stars, and smooth transitions

### Interactive Elements
- **Three-Panel Layout**: 
  - Left: Search results with filtering options
  - Center: Interactive knowledge graph visualization
  - Right: Detailed paper information
- **Dynamic Filtering**: Filter by year, topic, and other criteria
- **Loading States**: Beautiful loading spinners and states
- **AI Summary Generation**: Mock AI summary generation with loading states

## 🛠 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Cytoscape.js** - Graph visualization library
- **Lucide React** - Beautiful icon library
- **Headless UI** - Unstyled, accessible UI components

## 🎨 Design System

### Colors
- **Space Palette**: Deep blues and purples (#0f0f23, #1a1a2e, #16213e)
- **Cosmic Accent**: Bright purples and magentas (#d946ef, #c026d3)
- **Glass Effects**: Semi-transparent overlays with backdrop blur

### Animations
- Floating nebula backgrounds
- Twinkling star animations
- Smooth hover transitions
- Graph node interactions

## 📊 Data Structure

The application uses mock data representing NASA bioscience publications with:
- Publication metadata (title, authors, year, topic)
- Abstracts and AI-generated summaries
- Research connections and relationships
- Categorized tags and topics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd space-biology-knowledge-engine/client
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🎯 NASA Space Apps Challenge

This project was created for the NASA Space Apps Challenge, focusing on making NASA's bioscience research more accessible and visually engaging. The dashboard helps users:

- Discover connections between different research areas
- Understand complex scientific papers through AI summaries  
- Explore the breadth of NASA's biological research
- Navigate 608 publications in an intuitive, visual way

## 🌟 Key Components

### Navigation
- Responsive search bar with space-themed styling
- Quick access to About, Team, and NASA Space Apps links
- Mobile-friendly hamburger menu

### Search Results Panel
- Filterable list of publications
- Paper cards with titles, summaries, and metadata
- Visual indicators for selected papers
- Sort by relevance, year, or title

### Knowledge Graph
- Interactive network visualization
- Zoom, pan, and fullscreen capabilities
- Color-coded nodes by research category
- Connection strength visualization

### Paper Details Panel
- Tabbed interface for abstracts and AI summaries
- Related publications linking
- Citation formatting
- Bookmark and sharing options

## 🔮 Future Enhancements

- Real API integration for live NASA data
- Advanced filtering and search algorithms
- User accounts and personalized recommendations
- Export functionality for research citations
- Multi-language support
- Accessibility improvements

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for space exploration and scientific discovery**