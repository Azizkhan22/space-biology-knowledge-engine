# Space Biology Knowledge Engine - Complete Setup Guide

This guide will help you set up both the React client and Express API server for the Space Biology Knowledge Engine.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or cloud instance)
- Git

### 1. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/space-biology-knowledge-engine
CLIENT_URL=http://localhost:5173
HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
```

**Note**: The Hugging Face API token is optional. If not provided, AI features will show error messages but the rest of the application will work.

### 2. Database Setup

Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
# or
brew services start mongodb-community  # macOS
```

**Cloud MongoDB (MongoDB Atlas):**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Update the `MONGODB_URI` in your `.env` file

### 3. Seed the Database

Run the seed script to populate the database with sample articles:

```bash
cd server
node src/scripts/seedDatabase.js
```

This will create 5 sample articles with proper connections and metadata.

### 4. Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Client Setup

In a new terminal, navigate to the client directory:

```bash
cd client
npm install
```

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3001/api
```

### 6. Start the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

## 🧪 Testing the Integration

### Test the API

Run the API test script to verify all endpoints:

```bash
cd server
node src/scripts/testAPI.js
```

This will test:
- Health check endpoint
- Article retrieval
- Search functionality
- Knowledge graph
- AI services

### Test the Client

1. Open `http://localhost:5173` in your browser
2. You should see the Space Biology Knowledge Engine interface
3. The left panel should show suggested articles from the database
4. Click on an article to see details in the right panel
5. Try the search functionality
6. Test the AI summary and chat features

## 📁 Project Structure

```
space-biology-knowledge-engine/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── data/          # Mock data (fallback)
│   └── package.json
├── server/                 # Express API backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI integration
│   │   └── scripts/        # Database seeding & testing
│   └── package.json
└── SETUP_GUIDE.md
```

## 🔧 API Endpoints

### Articles
- `GET /api/articles/latest` - Get latest 20 articles
- `GET /api/articles/suggested` - Get suggested articles for home page
- `GET /api/articles/:id` - Get specific article details
- `POST /api/articles/search` - Search articles with filters
- `GET /api/articles/topic/:topic` - Get articles by topic
- `POST /api/articles/:id/summary` - Generate AI summary
- `POST /api/articles/:id/ask` - Ask AI questions

### Knowledge Graph
- `GET /api/knowledge-graph` - Get knowledge graph data

### Health
- `GET /api/health` - API health check

## 🛡️ Security Features

The API includes several security measures:

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for client origin
- **Helmet**: Security headers
- **Input Validation**: Request validation with express-validator
- **Error Handling**: Comprehensive error handling

## 🤖 AI Integration

The system integrates with Hugging Face for AI-powered features:

1. **Article Summarization**: Generate AI summaries of research papers
2. **Q&A System**: Ask questions about specific articles
3. **Context-Aware Responses**: AI responses are based on article content

### Setting up Hugging Face

1. Create an account at [Hugging Face](https://huggingface.co/)
2. Generate an API token
3. Add it to your server `.env` file as `HUGGINGFACE_API_TOKEN`

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Make sure MongoDB is running
- Check your connection string in `.env`
- For cloud MongoDB, ensure your IP is whitelisted

**2. CORS Errors**
```
Access to fetch at 'http://localhost:3001/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```
- Check that `CLIENT_URL` in server `.env` matches your client URL
- Restart the server after changing environment variables

**3. AI Service Errors**
```
Authentication error: Please check your API token
```
- Verify your Hugging Face API token
- Check that the token has proper permissions
- The application will work without AI features if the token is invalid

**4. No Articles Showing**
- Run the database seed script: `node src/scripts/seedDatabase.js`
- Check MongoDB connection
- Verify the database name in your connection string

**5. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3001
```
- Change the port in your server `.env` file
- Update the client `.env` file to match
- Or kill the process using the port

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs in the server console.

## 📊 Database Schema

### Article Document Structure
```javascript
{
  _id: ObjectId,
  title: String,
  authors: [String],
  year: Number,
  topic: String,
  abstract: String,
  aiSummary: String,
  tags: [String],
  connections: [ObjectId],
  relevanceScore: Number,
  doi: String,
  journal: String,
  methodology: String,
  results: String,
  conclusion: String,
  citations: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Production Deployment

### Server Deployment

1. Set environment variables for production
2. Use a production MongoDB instance
3. Set up SSL/TLS certificates
4. Use a process manager like PM2
5. Configure proper logging

### Client Deployment

1. Build the client: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API URLs for production
4. Configure CORS for your production domain

## 📝 Development Notes

- The client automatically falls back to mock data if the API is unavailable
- All API responses follow a consistent format with `success` and `data` fields
- Error handling is implemented at both client and server levels
- The knowledge graph is dynamically generated from article tags
- AI responses are cached in the database for performance

## 🎯 Next Steps

1. **Add More Articles**: Import real research papers into the database
2. **Enhance AI**: Fine-tune AI models for better space biology responses
3. **User Authentication**: Add user accounts and personalized features
4. **Advanced Search**: Implement faceted search and filters
5. **Visualization**: Enhance the knowledge graph visualization
6. **Mobile App**: Create a mobile version of the application

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Test the API endpoints individually

The application is designed to be robust and will gracefully handle most errors while providing helpful feedback to users.
