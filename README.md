# Trainer Tools

A collection of interactive web tools designed for trainers, teachers, and educators. Make your training sessions more engaging with professional tools for student management and team organization.

## Features

### Student Selector
- **Import students** - Paste a list of names (one per line) to quickly add your class
- **Random selection** - Choose 1 or more students with a fun animation
- **No repeats** - Selected students are marked as "used" and won't be picked again until you reset
- **Selection history** - Track who has been selected recently
- **Sound effects** - Drumroll and celebration sounds (can be toggled)
- **Full screen mode** - Distraction-free selection interface
- **Confetti celebration** - Because being chosen should feel special
- **Keyboard shortcuts** - Press spacebar to select students quickly

### Team Generator
- **Random team division** - Automatically divide students into balanced teams
- **Flexible team sizes** - Choose from 2-8 teams
- **Color-coded teams** - Each team has a unique color scheme
- **Visual organization** - Clean card-based layout for easy viewing
- **Sound effects** - Celebration sounds when teams are generated

### General Features
- **Persistent storage** - Student lists and settings saved in browser (survives page refresh)
- **Responsive design** - Works on desktop, tablet, and mobile devices
- **Modern UI** - Beautiful gradient design with smooth animations
- **No data collection** - All data stays in your browser

## Demo

Visit the live app: [trainer-tools.vercel.app](https://trainer-tools.vercel.app) *(Update with your actual deployment URL)*

## Run Locally

```bash
# Clone the repo
git clone https://github.com/canaokar/trainer-tools.git
cd trainer-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [canvas-confetti](https://github.com/catdad/canvas-confetti) - Confetti effects

## Project Structure

```
trainer-tools/
├── app/
│   ├── components/       # Shared components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── ToolCard.tsx
│   ├── config/          # Configuration files
│   │   └── tools.ts     # Tool registry
│   ├── types/           # TypeScript types
│   │   └── tools.ts
│   ├── tools/           # Individual tool pages
│   │   ├── selector/    # Student Selector tool
│   │   └── teams/       # Team Generator tool
│   ├── page.tsx         # Dashboard landing page
│   └── layout.tsx       # Root layout
```

## Adding New Tools

To add a new tool to the platform:

1. Add tool metadata to `/app/config/tools.ts`
2. Create `/app/tools/[tool-name]/page.tsx`
3. Tool automatically appears on dashboard

## License

MIT
