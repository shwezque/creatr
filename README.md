# Creatr

Creator monetization platform. Connects social accounts, analyzes audience and content performance, generates shoplinks, and unlocks creator financing — all in one dashboard.

## Overview

Creatr is built for content creators on YouTube, TikTok, and Instagram who want to turn their audience into revenue. The platform handles the full monetization stack: connect your accounts, get an AI-powered analysis of your content and engagement, receive product recommendations matched to your niche, generate affiliate shoplinks, and access creator credit based on your channel metrics.

## Features

- **Social account connection** — Link YouTube, TikTok, and Instagram accounts
- **Content analysis** — AI scoring of engagement, consistency, content categories, and audience region
- **Product recommendations** — Niche-matched product suggestions from brand partnerships
- **Shoplinks generator** — Auto-generated affiliate links with copy-paste embed codes
- **Leaderboard** — Creator rankings by engagement score and category
- **Co-create** — Brand collaboration application flow
- **Creator credit** — Financing eligibility assessment based on channel metrics (tier A–D scoring)
- **Analytics dashboard** — Event tracking and performance overview

## Tech Stack

**Frontend**
- React 18 + TypeScript
- TanStack Router + TanStack Query
- Tailwind CSS + Radix UI
- Vite

**Backend**
- Fastify (Node.js)
- Prisma ORM + SQLite
- Zod (validation)

**Infrastructure**
- Netlify (frontend)
- Docker (API)

## Structure

```
creatr/
├── apps/
│   ├── web/        # React frontend
│   └── api/        # Fastify backend
└── packages/
    └── shared/     # Shared types and utilities
```

## Setup

```bash
# Install all dependencies
npm install

# Run API
cd apps/api
npm run db:push
npm run dev

# Run frontend (separate terminal)
cd apps/web
npm run dev
```
