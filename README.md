# Teachassist Community
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Readtt/teachassist-community)

Teachassist Community is an open-source platform for **YRDSB Teachassist** students to view their grades in a modern dashboard and compare performance through **anonymous leaderboards** and **course/class averages**.

When you sign in, your Teachassist data is automatically synced and your **current, midterm, and final marks** are kept up to date and reflected across rankings.

## Key Features

- **Auto-Sync on Login**  
  Your Teachassist grades sync automatically every time you sign in.

- **Modern Grade Dashboard**  
  See all enrolled courses and your marks displayed cleanly on the home page.

- **Anonymous Leaderboards (Auto Opt-In)**  
  You’re automatically included in an anonymous leaderboard to compare ranks without exposing identity by default.

- **3 Ranking Modes (Class / School / District)**  
  Instantly view where you stand across:
  - **Class** (your specific classroom)
  - **School** (your whole school)
  - **District / Global** (across all users / YRDSB)

- **Averages at Every Level**  
  See course averages for:
  - your **classroom**
  - your **school**
  - the **district/global dataset**

- **Search Across All Courses**  
  Search and explore all courses currently on the site.

- **Homeroom / Classroom Insights**  
  View averages tied to specific homerooms/classrooms.

- **Leaderboard Privacy Toggle**  
  Choose whether your **student number** is visible on leaderboards (toggle on/off).

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router & RSC)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication**: [Better Auth](https://better-auth.dev/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **Background Jobs**: [Trigger.dev](https://trigger.dev/)
-   **Web Scraping**: [Cheerio](https://cheerio.js.org/) with [Zyte API](https://www.zyte.com/data-api/) as a proxy service.
-   **Deployment**: Frontend on [Vercel](https://vercel.com/), Background Jobs on [Trigger.dev](https://trigger.dev/).

## Getting Started

Follow these instructions to set up the project for local development.

### Prerequisites

-   Node.js (v20.x or later)
-   npm
-   A running PostgreSQL instance

### 1. Clone the Repository

```bash
git clone https://github.com/readtt/teachassist-community.git
cd teachassist-community
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Populate the `.env` file with your credentials:

-   `DATABASE_URL`: Your PostgreSQL connection string.
-   `BETTER_AUTH_SECRET`: A secret string for signing auth tokens (generate one with `openssl rand -hex 32`).
-   `BETTER_AUTH_URL`: The base URL of your local server (e.g., `http://localhost:3000`).
-   `TA_AUTH_SECRET`: A secret string for encrypting Teachassist passwords (generate one with `openssl rand -hex 32`).
-   `ZYTE_API_KEY`: Your API key from Zyte for the web scraping proxy.

### 4. Set Up the Database

Push the Drizzle schema to your database. This will create the necessary tables.

```bash
npm run db:push
```

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## Available Scripts

-   `npm run dev`: Starts the Next.js development server with Turbo.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the project files.
-   `npm run db:push`: Pushes the current schema to the database using Drizzle Kit.
-   `npm run db:studio`: Opens Drizzle Studio to browse your database.
-   `npm run deploy:trigger-prod`: Deploys background jobs to Trigger.dev.

## Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, feel free to open an issue or submit a pull request.