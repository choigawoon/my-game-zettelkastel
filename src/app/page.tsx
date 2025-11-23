import { GraphView } from '@/components/GraphView';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Interactive Game Dev Course
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Explore the knowledge graph to learn game development concepts.
          </p>
        </div>

        <GraphView />
      </div>
    </main>
  );
}
