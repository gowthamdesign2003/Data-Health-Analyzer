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

## License

MIT
