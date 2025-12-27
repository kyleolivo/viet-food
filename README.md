# Food Identifier

A mobile-friendly web application that uses AI to identify food from photos. Take or upload a photo of any dish, and the app will identify it, provide a description, and save it to your personal gallery.

## Features

- **Photo Capture/Upload**: Take photos directly from your mobile device or upload existing images
- **AI-Powered Identification**: Uses Anthropic's Claude Vision API to identify foods and provide descriptions
- **Smart Storage**: Stores optimized images using Vercel Blob Storage
- **Mobile-Optimized Gallery**: Browse your food collection in a beautiful, responsive grid layout
- **Detailed View**: Tap any food to see the full image, name, description, and date added

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Image Storage**: Vercel Blob Storage
- **AI**: Anthropic Claude 3.5 Sonnet with Vision
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Vercel account
- An Anthropic API key

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd viet-food
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Anthropic API key
   - If testing database locally, add your Postgres credentials

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

On first deployment or local setup, initialize the database by visiting:
```
http://localhost:3000/api/init-db
```

This will create the `food_entries` table.

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Add Vercel Postgres

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Follow the prompts to create your database
5. Vercel will automatically add the required environment variables

### Step 4: Add Vercel Blob Storage

1. In the "Storage" tab, click "Create Database"
2. Select "Blob"
3. Follow the prompts to create your blob storage
4. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

### Step 5: Add Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com) and get an API key
2. In your Vercel project, go to "Settings" > "Environment Variables"
3. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key

### Step 6: Initialize Database

After deployment, visit:
```
https://your-app.vercel.app/api/init-db
```

This creates the necessary database table.

## Environment Variables

Required environment variables:

```
# Anthropic API (manually add)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Vercel Postgres (auto-added by Vercel)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Vercel Blob Storage (auto-added by Vercel)
BLOB_READ_WRITE_TOKEN=
```

## Usage

1. **Add a Food**:
   - Click the "Add Food" tab
   - Choose "Take Photo" (on mobile) or "Upload Photo"
   - Wait for AI identification
   - Review the name and description
   - Click "Save" to add to your gallery

2. **Browse Gallery**:
   - View all your saved foods in the Gallery tab
   - Click any food to see full details
   - Foods are sorted by most recent first

## Project Structure

```
viet-food/
├── app/
│   ├── api/
│   │   ├── foods/          # API routes for food CRUD
│   │   ├── identify/       # AI food identification endpoint
│   │   └── init-db/        # Database initialization
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main page with tabs
├── components/
│   ├── FoodGallery.tsx     # Gallery grid view
│   └── PhotoUpload.tsx     # Photo capture/upload component
├── lib/
│   ├── db.ts               # Database functions
│   └── types.ts            # TypeScript interfaces
├── next.config.ts          # Next.js configuration
└── vercel.json             # Vercel deployment config
```

## API Routes

- `GET /api/foods` - Fetch all food entries
- `POST /api/foods` - Save a new food entry
- `POST /api/identify` - Identify food from image
- `GET /api/init-db` - Initialize database tables

## License

MIT

## Acknowledgments

- Powered by [Anthropic Claude](https://www.anthropic.com)
- Hosted on [Vercel](https://vercel.com)
