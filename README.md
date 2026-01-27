# 🧠 Space Biology Knowledge Engine

## 🚀 Introduction
The **Space Biology Knowledge Engine** is an AI-powered platform that extracts, organizes, and visualizes information from Nasa's scientific research in **space biology**. It addresses the challenge of information overload by transforming unstructured research papers into an interconnected **knowledge graph**, enabling researchers to explore relationships between biological entities, experiments, and environmental conditions in space.

By integrating **Natural Language Processing (NLP)**, **machine learning**, and **graph databases**, the system empowers scientists to discover hidden connections, generate new hypotheses, and accelerate insights into human health and biological adaptation in space environments.

---

## ⚙️ Functionality

- **Automated Data Extraction** – Extracts entities like genes, proteins, and biological processes from research articles using NLP.  
- **Knowledge Graph Generation** – Builds an interactive graph using **Neo4j**, connecting related biological concepts.  
- **Semantic Search** – Uses embedding-based similarity (via `all-mpnet-base-v2`) to find related studies and entities.  
- **Question Answering** – Employs **Mistral-7B-Instruct** to generate context-aware answers and summaries from extracted data.  
- **Visualization Dashboard** – Provides an intuitive front-end interface to explore the graph visually and search dynamically.

---

## 🧰 Tech Stack

### **Backend**
- **Node.js** + **Express.js** – API and server logic  
- **Neo4j** – Graph database for entity relationships  
- **MongoDB** - Articles scrapped and stored in Database

### **Frontend**
- **React.js** – User interface  
- **Cytoscape.js** – Graph visualization  
- **Tailwind CSS** – UI styling

### **AI / NLP Models**
- **Mistral-7B-Instruct** – Contextual summarization and question answering  
- **SciSpaCy (en_core_sci_sm)** – Scientific entity extraction  
- **all-mpnet-base-v2** – Semantic embedding and similarity search

---

## 🧩 Architecture Overview
1. Raw research text is processed through NLP pipelines.  
2. Extracted entities and relations are stored in Neo4j.  
3. Embeddings enable semantic similarity and contextual linking.  
4. The React front-end visualizes this knowledge network interactively.

---

## 💡 Impact
The Space Biology Knowledge Engine enhances **research efficiency** and **scientific discovery** by connecting fragmented space biology knowledge into a unified, intelligent system. It can be extended to other domains like biotechnology, medicine, or environmental sciences.

---

## 🧠 Team & Accomplishment
Developed and Designed by the Team **DEIBYTE** whose members include **Aziz Ullah** & **Syed Muhammad Khizer**.
**Awarded 1st Place 🏆** at the Nasa Space Apss Challenge Hackathon.
