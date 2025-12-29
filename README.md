# Food Identifier

A mobile-friendly web application that uses AI to identify food from photos. Perfect for travelers exploring Vietnamese cuisine, this app helps you identify, capture, and remember the amazing foods you encounter. Take or upload a photo of any dish, add optional context, and let AI identify it with key ingredients and cultural significance.

## Features

### Core Features
- **Photo Capture/Upload**: Take photos directly from your mobile device or upload existing images
- **Optional Context**: Add notes like "eaten at street vendor in Hanoi" to help with identification
- **AI-Powered Identification**: Uses Anthropic's Claude Vision API to identify foods with:
  - Name of the dish
  - Key ingredients
  - Cultural significance and what makes it special in the region
- **Smart Storage**: Stores optimized images using Vercel Blob Storage
- **Paginated Gallery**: Browse your food collection with pagination (20 items per page)
- **Detailed View**: Tap any food to see full image, name, ingredients, description, your notes, and date added

### Security & Safety Features
- **Content Moderation**: AI-powered moderation checks for inappropriate images and text
- **Rate Limiting**:
  - 20 identifications per hour
  - 30 saves per hour
  - 100 API calls per hour
- **Audit Logging**: Comprehensive logging of all user actions for security and debugging
- **Abuse Detection**: Automatic detection and account locking for abusive behavior
- **Alert System**: Admin notifications when abuse is detected

### Demo Mode
- **Public Demo**: View sample Vietnamese dishes at `/demo` without signing up
- **No Authentication Required**: Safely explore the app's capabilities before creating an account

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk (Google & Apple OAuth)
- **Database**: Neon Postgres (via Vercel Marketplace)
- **Image Storage**: Vercel Blob Storage
- **AI**: Anthropic Claude 3.5 Sonnet with Vision
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Vercel account
- A Clerk account (free tier available)
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
   - Add your Clerk keys (get from Clerk dashboard)
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

This will create the following tables:
- `food_entries` - User's saved food identifications
- `audit_logs` - Security and audit logging
- `user_status` - User account status and abuse tracking

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

### Step 3: Set up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. In the Clerk dashboard, go to "Configure" > "SSO Connections"
4. Enable **Google** and **Apple** (or other providers you want)
   - For Google: Use Clerk's test credentials or add your own OAuth app
   - For Apple: Requires Apple Developer account credentials
5. Copy your API keys from the Clerk dashboard
6. In Vercel, go to "Settings" > "Environment Variables" and add:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

### Step 4: Add Database (Neon Postgres)

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select **Neon** (or Supabase - both are Postgres)
4. Follow the prompts to create your database
5. Vercel will automatically add the required environment variables

### Step 5: Add Vercel Blob Storage

1. In the "Storage" tab, click "Create Database"
2. Select "Blob"
3. Follow the prompts to create your blob storage
4. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

### Step 6: Add Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com) and get an API key
2. In your Vercel project, go to "Settings" > "Environment Variables"
3. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key

### Step 7: Initialize Database

After deployment, visit:
```
https://your-app.vercel.app/api/init-db
```

This creates the necessary database table.

## Environment Variables

Required environment variables:

```
# Clerk Authentication (manually add from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Anthropic API (manually add)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Neon Postgres (auto-added by Vercel when you connect Neon)
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

1. **Try the Demo** (Optional):
   - Visit `/demo` to see sample Vietnamese dishes without signing up
   - Explore the interface and see how food identification works

2. **Sign In**:
   - Visit the app and you'll be redirected to sign in
   - Choose "Continue with Google" or "Continue with Apple"
   - Or sign up with email/password

3. **Add a Food**:
   - Click the "Add Food" tab
   - (Optional) Add context in the text field (e.g., "Spicy noodle soup from Hanoi")
   - Choose "Take Photo" (on mobile) or "Upload Photo"
   - Wait for AI identification with content moderation
   - Review the name, ingredients, and description
   - Click "Save" to add to your gallery

4. **Browse Gallery**:
   - View all your saved foods in the Gallery tab
   - Navigate through pages if you have more than 20 foods
   - Click any food to see full details including ingredients and your notes
   - Foods are sorted by most recent first
   - Only you can see your foods (private to your account)

5. **User Menu**:
   - Click your profile picture in the top right
   - Access account settings or sign out

## Security & Privacy

### Content Moderation
- All uploaded images are automatically checked for inappropriate content
- User-provided text context is moderated for hate speech, harassment, and spam
- Violations are logged and may result in automatic account locking

### Rate Limiting
To prevent abuse, the following limits apply:
- **Food Identification**: 20 per hour
- **Save Food**: 30 per hour
- **API Calls**: 100 per hour

If you exceed these limits, you'll receive a 429 error. Limits reset hourly.

### Audit Logging
All actions are logged including:
- User ID and timestamp
- Action performed (identify, save, list)
- Success/failure/blocked status
- IP address and user agent
- Details of the action

### Abuse Detection
The system automatically:
- Tracks blocked actions per user
- Locks accounts after 10 blocked actions in an hour
- Locks accounts after 50 total blocked actions
- Sends admin alerts when accounts are locked
- Provides detailed audit trails for investigation

### Data Privacy
- Your food entries are private and only visible to you
- Images are stored securely in Vercel Blob Storage
- Authentication is handled by Clerk with industry-standard security
- All API endpoints require authentication
- Database uses secure Postgres connections

## Project Structure

```
viet-food/
├── app/
│   ├── api/
│   │   ├── foods/          # API routes for food CRUD with pagination
│   │   ├── identify/       # AI food identification with moderation
│   │   └── init-db/        # Database initialization (all tables)
│   ├── demo/               # Public demo page
│   ├── sign-in/            # Clerk sign-in page
│   ├── sign-up/            # Clerk sign-up page
│   ├── layout.tsx          # Root layout with ClerkProvider
│   └── page.tsx            # Main app page with tabs
├── components/
│   ├── FoodGallery.tsx     # Gallery with pagination
│   └── PhotoUpload.tsx     # Photo upload with context input
├── lib/
│   ├── audit.ts            # Audit logging functions
│   ├── db.ts               # Database functions for food entries
│   ├── moderation.ts       # Content moderation with Claude
│   ├── security.ts         # Rate limiting, abuse detection, account locking
│   └── types.ts            # TypeScript interfaces
├── middleware.ts           # Clerk auth middleware
├── next.config.ts          # Next.js configuration
└── vercel.json             # Vercel deployment config
```

## API Routes

### Public Routes
- `GET /api/init-db` - Initialize database tables (food_entries, audit_logs, user_status)

### Authenticated Routes
All routes below require authentication and include rate limiting and audit logging:

- `GET /api/foods?limit=20&offset=0` - Fetch paginated food entries for current user
  - Returns: `{ entries: FoodEntry[], total: number, limit: number, offset: number }`
  - Rate limit: 100 per hour

- `POST /api/foods` - Save a new food entry
  - Body: `{ name, description, ingredients, imageUrl, userContext }`
  - Rate limit: 30 per hour
  - Includes account lock check

- `POST /api/identify` - Identify food from image
  - Body: FormData with `image` file and optional `context` text
  - Rate limit: 20 per hour
  - Includes content moderation for both image and text
  - Returns: `{ name, description, ingredients: string[], imageUrl }`

## License

MIT

## Acknowledgments

- Powered by [Anthropic Claude](https://www.anthropic.com)
- Hosted on [Vercel](https://vercel.com)
