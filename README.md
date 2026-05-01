# Data Health Analyzer AI

A beautiful, modern data quality analyzer with AI-powered insights!

## Features

- 📊 **Data Upload** - CSV, Excel (XLSX/XLS), or JSON data
- 🔍 **Column Analysis** - Calculate fill rates, null counts, and quality status
- 🤖 **AI Insights** - Smart analysis of your data quality
- 📝 **Report Generation** - Beautiful summary with downloadable JSON
- 💾 **Supabase Integration** - Save all your analyses to Supabase!

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (database)
- Papa Parse (CSV parser)
- XLSX (Excel parser)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gowthamdesign2003/Data-Health-Analyzer.git
   cd Data-Health-Analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit http://localhost:3000

## Supabase Setup

1. Create a project on Supabase
2. Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env.local`

## Deploy to Render

### Prerequisites
- GitHub account with your project repository
- Render account (free tier available)
- Supabase project with your database
- OpenAI API key

### Step-by-Step Deployment

1. **Push your code to GitHub** (already done!)

2. **Sign up for Render** at https://render.com

3. **Create a new Web Service**:
   - Go to your Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

4. **Configure the Web Service**:
   - **Name**: Data Health Analyzer (or your preferred name)
   - **Region**: Choose the one closest to you
   - **Branch**: main (or your default branch)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade if needed)

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   OPENAI_API_KEY=your_openai_api_key
   ```

6. **Deploy!**
   - Click "Create Web Service"
   - Wait for Render to build and deploy your app (this takes a few minutes)
   - Once deployed, you'll get a URL like `https://your-app-name.onrender.com`

### Important Notes
- **Free Tier Limitations**: Render's free tier has 750 hours/month and spins down after 15 minutes of inactivity
- **Environment Variables**: Make sure to use the **public** Supabase key (not the service role key)
- **Build Time**: The first build may take a few minutes
- **Custom Domain**: You can add a custom domain in Render settings after deployment

### Troubleshooting
- If build fails: Check that all dependencies are in package.json
- If app shows errors: Verify environment variables are correctly set
- If Supabase connection fails: Make sure your Supabase URL and key are correct

## License

MIT
