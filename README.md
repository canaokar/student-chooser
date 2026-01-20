# Student Chooser

A fun, interactive web app to randomly select students for classroom activities. Perfect for trainers and teachers who need to pick students when no one volunteers!

## Features

- **Import students** - Paste a list of names (one per line) to quickly add your class
- **Random selection** - Choose 1 or more students with a fun animation
- **No repeats** - Selected students are marked as "used" and won't be picked again until you reset
- **Confetti celebration** - Because being chosen should feel special
- **Persistent storage** - Student list and used status saved in browser (survives page refresh)

## Demo

Visit the live app: [student-chooser.vercel.app](https://student-chooser.vercel.app)

## Run Locally

```bash
# Clone the repo
git clone https://github.com/canaokar/student-chooser.git
cd student-chooser

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

## License

MIT
