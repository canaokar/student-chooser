import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black text-white">Trainer Tools</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-medium"
          >
            All Tools
          </Link>
        </div>
      </div>
    </nav>
  );
}
