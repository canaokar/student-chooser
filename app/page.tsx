import ToolCard from "./components/ToolCard";
import Footer from "./components/Footer";
import { tools } from "./config/tools";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-12 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-block">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-2xl tracking-tight">
                Trainer Tools
              </h1>
              <div className="h-1.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-violet-100 font-medium max-w-3xl mx-auto leading-relaxed">
            Professional tools for trainers, teachers, and educators
          </p>
          <p className="text-base text-violet-200/80 max-w-2xl mx-auto mt-4">
            Make your training sessions more engaging with interactive tools designed for the modern classroom
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-white font-bold text-base mb-2">Always Saved</h3>
            <p className="text-violet-200 text-sm">
              Your student lists and settings are automatically saved in your browser
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-white font-bold text-base mb-2">Beautiful Design</h3>
            <p className="text-violet-200 text-sm">
              Modern, responsive interface that works on any device
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-bold text-base mb-2">Privacy First</h3>
            <p className="text-violet-200 text-sm">
              No data collection, everything stays in your browser
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
