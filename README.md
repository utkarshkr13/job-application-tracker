# Job Application Tracker

Track your job applications from Gmail and Outlook in one clean dashboard.

## Features

- **Dashboard** with 4 stat cards: Total Applied, Confirmed, Rejected, No Response
- **Auto-sync** from Gmail and Outlook using keyword detection
- **Manual add/edit** for any application
- **Status management** — update status inline from any table row
- **Search & filter** by company, role, or status
- **Response rate** progress bar visualization
- Deployed on Vercel, data stored in Supabase

## Quick Start

```bash
git clone https://github.com/utkarshkr13/job-application-tracker.git
cd job-application-tracker
npm install
cp .env.example .env.local
# Fill in env vars, then:
npm run dev
```

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (Postgres — project `nvlgznexhlnyyypgxslx`)
- **Gmail API** + **Microsoft Graph API**
- **Vercel** (hosting)
