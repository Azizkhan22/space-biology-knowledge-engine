# Space Biology Knowledge Engine - API Server

This is the Express.js API server for the Space Biology Knowledge Engine, providing secure endpoints for article management, AI-powered analysis, and knowledge graph functionality.

## Features

- **Article Management**: CRUD operations for research articles with MongoDB
- **AI Integration**: Hugging Face AI for article summarization and Q&A
- **Knowledge Graph**: Dynamic entity relationships and topic connections
- **Search Functionality**: Full-text search with filtering capabilities
- **Security**: Rate limiting, CORS, Helmet security headers
- **Validation**: Input validation and error handling

## API Endpoints

### Articles
- `GET /api/articles/latest` - Get latest articles (paginated)
- `GET /api/articles/suggested` - Get suggested articles for home page
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles/search` - Search articles with filters
- `GET /api/articles/topic/:topic` - Get articles by topic
- `POST /api/articles/:id/summary` - Generate AI summary
- `POST /api/articles/:id/ask` - Ask AI questions about article

### Knowledge Graph
- `GET /api/knowledge-graph` - Get knowledge graph data

### Health Check
- `GET /api/health` - API health status

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Hugging Face API token (optional, for AI features)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the server root directory:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/space-biology-knowledge-engine
   CLIENT_URL=http://localhost:5173
   HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or use a cloud instance.

4. **Seed the database (optional):**
   ```bash
   node src/scripts/seedDatabase.js
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## Database Schema

### Article Model
- `title`: Article title (required)
- `authors`: Array of author names (required)
- `year`: Publication year (required)
- `topic`: Research topic (required)
- `abstract`: Article abstract (required)
- `aiSummary`: AI-generated summary (optional)
- `tags`: Array of tags (optional)
- `connections`: Related article IDs (optional)
- `relevanceScore`: Relevance score 0-1 (optional)
- `doi`: Digital Object Identifier (optional)
- `journal`: Journal name (optional)
- `methodology`: Research methodology (optional)
- `results`: Research results (optional)
- `conclusion`: Research conclusion (optional)
- `citations`: Citation count (optional)

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for client origin
- **Helmet**: Security headers
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling middleware

## Development

### Project Structure
```
src/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── articleController.js # Article business logic
├── middleware/
│   └── validation.js        # Input validation rules
├── models/
│   └── Article.js           # MongoDB schema
├── routes/
│   ├── articleRoutes.js     # Article endpoints
│   ├── knowledgeGraphRoutes.js # Knowledge graph endpoints
│   └── index.js             # Route configuration
├── scripts/
│   └── seedDatabase.js      # Database seeding script
├── services/
│   └── aiService.js         # AI integration service
└── app.js                   # Express app configuration
```

### Adding New Endpoints

1. Create controller method in `controllers/articleController.js`
2. Add validation rules in `middleware/validation.js`
3. Define route in `routes/articleRoutes.js`
4. Update this README with endpoint documentation

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Check your MongoDB URI and ensure MongoDB is running
2. **CORS Errors**: Verify CLIENT_URL matches your frontend URL
3. **AI Service Errors**: Check Hugging Face API token and model availability
4. **Rate Limiting**: Adjust rate limit settings if needed

### Logs
- Development: Detailed logs with Morgan
- Production: Structured logging recommended

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## License

ISC

## Neo4j Aura Setup for Knowledge Graph

1. Add your Neo4j Aura credentials to a `.env.neo4j` file in the server root:
   ```env
   NEO4J_URI=neo4j+s://<your-neo4j-uri>
   NEO4J_USERNAME=<your-username>
   NEO4J_PASSWORD=<your-password>
   ```
2. The backend will use these credentials to connect to the Neo4j Aura instance for knowledge graph queries.