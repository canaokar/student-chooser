import Link from "next/link";
import { Tool } from "../types/tools";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={tool.path} className="group block h-full">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 h-full flex flex-col border-2 border-transparent hover:border-white/20">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-4xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-110 transform transition-transform`}>
            {tool.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
              {tool.name}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              {tool.description}
            </p>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-base group-hover:gap-3 transition-all">
            <span>Launch Tool</span>
            <svg className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
