# 🔮 Trend Arbitrage (Prototype)

A MERN-style prototype (**PostgreSQL instead of MongoDB**) that detects **early-stage trends** by measuring the **velocity and acceleration of mentions** across **non-trending data sources**.

This project is a **full-stack prototype** that finds **emerging tech trends before they become mainstream**.

Instead of using “trending” pages, it pulls **new content** from smaller or early-signal sources and uses a **custom scoring algorithm** to detect what topics are **starting to rise quickly**.

---

## 🚀 What This App Does

The app:

- Pulls new content from:
  - Hacker News (`/newstories`)
  - Lobste.rs (via web scraping)
  - GitHub (recent repositories)
- Extracts topics and phrases from titles
- Stores mentions in a PostgreSQL database (Neon)
- Calculates a **rising score** based on:
  - How fast mentions are increasing
  - Whether growth is accelerating
  - Engagement (stars, comments)
  - Number of sources
- Displays the top emerging trends in a simple React UI

---

## 🧱 Tech Stack

### Frontend

- React
- JavaScript
- HTML / CSS

### Backend

- Node.js
- Express
- PostgreSQL (Neon)
- node-fetch
- cheerio (for scraping Lobste.rs)

---

## 📁 Folder Structure

trend-arbitrage/  
├── server/  
│ ├── index.js # Express server entry  
│ ├── routes/ # API routes  
│ ├── services/ # Data fetchers + logic  
│ ├── db/ # PostgreSQL connection  
│ └── models/ # SQL tables  
│  
├── client/  
│ ├── src/  
│ │ └── App.jsx # React UI  
│  
├── .env # Environment variables  
└── README.md

---

---

## ⚙️ Setup Instructions

### 1. Clone the Project

```bash
git clone <your-repo-url>
cd trend-arbitrage
```

### 2. Backend Setup

`cd server npm install`

Create a `.env` file in the **root folder**:

`DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require PORT=3000`

Start the server:

`node index.js`

Test it:

`curl http://127.0.0.1:3000/health`

You should see:

`OK`

### 3. Database Setup (PostgreSQL / Neon)

Create the following tables in your PostgreSQL database:

`CREATE TABLE mentions (   id SERIAL PRIMARY KEY,  
category TEXT,   source TEXT,   creator TEXT,   normalized_topic TEXT,   display_topic TEXT,   created_at TIMESTAMP,   points INT,   comments INT,   raw_title TEXT,   raw_url TEXT );  CREATE TABLE trends (   id SERIAL PRIMARY KEY,   category TEXT,   normalized_topic TEXT,   display_topic TEXT,   score FLOAT,   sources_list TEXT[],   creator_diversity INT,   mentions_recent INT,   mentions_prev INT,   mentions_7d INT,   engagement_recent INT,   computed_at TIMESTAMP,   last_seen_at TIMESTAMP,   UNIQUE (category, normalized_topic) );`

---

### 4. Frontend Setup

`cd client
`npm install`
`npm run dev `

Open the browser at:

`http://localhost:5173`

---

## 📈 How Trend Detection Works

Each time you click **Refresh**:

- New posts are fetched
- Titles are cleaned and split into words and short phrases
- Each word or phrase becomes a **mention**
- Mentions are grouped by topic
- The system calculates:
  - Mentions in the last **2 hours**
  - Mentions in the **previous 2 hours**
  - Mentions in the last **7 days**
- A **rising score** is calculated

---

## 🧮 Rising Score Formula (High Level)

- Topics growing faster than before score higher
- Topics with engagement score higher
- Topics from multiple sources score higher
- Topics that are already old are penalized

This helps surface **early-stage trends**, not already-popular ones.

---

## 🌐 Why These Data Sources

| Source      | Reason                           |
| ----------- | -------------------------------- |
| Hacker News | Early technical discussions      |
| Lobste.rs   | Smaller community, early signals |
| GitHub      | Real-world developer adoption    |

---

## ⚠️ Assumptions & Trade-Offs

- This is a prototype, not production-ready
- Scraping Lobste.rs may break if HTML changes
- No user authentication
- No scheduled background jobs (manual refresh only)
- Only the **tech** category is implemented to stay focused

---

## 🧑‍💻 How to Use the App

1. Select the category (`tech`)
2. Choose a limit
3. Click **Refresh**
4. View emerging topics with:

   - Rising score
   - Mentions growth
   - Sources

---

## 📊 Example Output

| Topic            | Score | Mentions | Sources    |
| ---------------- | ----- | -------- | ---------- |
| video generator  | 5.78  | 3 / 0    | hackernews |
| local llm        | 6.52  | 5 / 0    | hackernews |
| prompt injection | 7.17  | 5 / 0    | hackernews |

---

## 🚧 What I Would Improve With More Time

- Add clustering (group similar topics)
- Add more categories (music, dance, entertainment)
- Add scheduled background refresh
- Improve NLP with embeddings
- Add charts for trend history

---

## ⭐ Why This Project Matters

This project demonstrates:

- API integration
- Web scraping
- Database design
- Data aggregation
- Custom trend-detection algorithms
- Full-stack thinking

It focuses on **finding signal before it becomes obvious**.
