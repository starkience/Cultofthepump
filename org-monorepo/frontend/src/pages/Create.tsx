// src/pages/Create.tsx
import { useState } from "react";
import { ArrowRight, Wand2 } from "lucide-react";

type GenerationMode = "guided" | "ai";

export default function Create() {
  const [mode, setMode] = useState<GenerationMode>("guided");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-display">
          Create Your Memecoin
        </h1>
        <p className="mt-2 text-gray-400">
          Launch your memecoin in minutes with AI-powered tools
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setMode("guided")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            mode === "guided"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <ArrowRight size={20} />
          Guided Creation
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            mode === "ai"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Wand2 size={20} />
          AI Generation
        </button>
      </div>

      {mode === "guided" ? (
        <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Token Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g., Pepe 2.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Token Symbol
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g., PEPE2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Tell us about your memecoin..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Social Links
            </label>
            <div className="space-y-3 mt-2">
              <input
                type="text"
                className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Twitter URL"
              />
              <input
                type="text"
                className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Telegram Group URL"
              />
            </div>
          </div>

          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded">
            Create Token
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Describe your memecoin idea
            </label>
            <textarea
              rows={6}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g., I want to create a memecoin based on the left side of the bell curve meme, targeting people who simply enjoy trading without overthinking..."
            />
          </div>

          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2">
            <Wand2 size={20} />
            Generate Token
          </button>

          {/* AI Preview Section (initially hidden) */}
          <div className="mt-8 p-4 border border-gray-700 rounded-lg hidden">
            <h3 className="text-lg font-medium text-white mb-4">
              AI Generated Preview
            </h3>
            {/* Preview content would go here */}
          </div>
        </div>
      )}
    </div>
  );
}
