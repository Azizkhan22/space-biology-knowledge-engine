# Space Biology Knowledge Engine - Setup Guide

This guide explains how to install and run the React client and Express API server for the Space Biology Knowledge Engine.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Azizkhan22/space-biology-knowledge-engine.git
cd space-biology-knowledge-engine
```

### 2. Server Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

#### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_uri_here
CLIENT_URL=http://localhost:5173
HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
```

Create a `.env.neo4j` file in the `server` directory:

```env
NEO4J_URI=your_neo4j_uri_here
NEO4J_USERNAME=your_neo4j_username
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j
```

> **Note:**  
> The production website uses deployed MongoDB and Neo4j databases.  
> **To use the real data, request the MongoDB URI and Neo4j access from the repository owner.**  
> Alternatively, you can set up your own databases and update the URIs above.

### 3. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

---

### 4. Client Setup

Open a new terminal, navigate to the `client` directory, and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Start the Client

```bash
npm run dev
```

The client will start on `http://localhost:5173`.

---

## 📝 Notes

- Article data is stored in MongoDB.
- The knowledge graph is powered by Neo4j.
- For production data, contact the repository owner for access credentials.
- You can also use your own MongoDB and Neo4j instances if you prefer.

---

## 📞 Support

If you encounter any issues:

- Ensure all dependencies are installed.
- Verify your environment variables are set correctly.
- Contact the repository owner for database access if needed.

---
