export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#070913] text-white p-20 flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-4xl font-bold font-heading">Aether AI Engineering Blog</h1>
      <p className="text-gray-400 max-w-md">Phase 9 Polish: MDX blog scaffolding ready. Discover how we built a 1536-dimensional RAG engine on edge computing.</p>
      <a href="/" className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-500 transition">Back to Home</a>
    </div>
  );
}