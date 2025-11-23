import { GraphView } from '@/components/GraphView';
import { TableOfContentsView } from '@/components/TableOfContentsView';
import { Header } from '@/components/header';
import { getGraph } from '@/lib/content';
import { ViewToggle } from '@/components/ViewToggle';

export default function Home() {
  const graph = getGraph();

  return (
    <>
      <Header />
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            게임 개발 인터랙티브 강의
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-muted-foreground">
            지식 그래프를 탐색하며 게임 개발 개념을 학습하세요
          </p>
        </div>

        <ViewToggle graph={graph} />
      </main>
    </>
  );
}
