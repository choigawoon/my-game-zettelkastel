import { getContent, getAllNodeIds, getNode } from '@/lib/content';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
    const ids = getAllNodeIds();
    return ids.map((id) => ({
        slug: [id],
    }));
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const id = slug[0];
    const node = getNode(id);
    const contentFile = getContent(id);

    if (!node) {
        notFound();
    }

    let content = null;
    if (contentFile) {
        const { content: compiledContent } = await compileMDX({
            source: contentFile.content,
            options: { parseFrontmatter: true },
        });
        content = compiledContent;
    }

    // Get badge variant based on node type
    const getBadgeVariant = (type: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
        switch (type) {
            case 'root': return 'default';
            case 'category': return 'default';
            case 'case': return 'secondary';
            case 'fundamental': return 'secondary';
            case 'decision': return 'secondary';
            default: return 'outline';
        }
    };

    const getNodeTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            root: '메인',
            category: '카테고리',
            case: '사례 연구',
            fundamental: '기본 원리',
            decision: '설계 결정',
        };
        return labels[type] || type;
    };

    return (
        <>
            <Header />
            <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            돌아가기
                        </Button>
                    </Link>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Badge variant={getBadgeVariant(node.type)}>
                                    {getNodeTypeLabel(node.type)}
                                </Badge>
                                {node.data.demoPath && (
                                    <Link href={node.data.demoPath}>
                                        <Button variant="outline" size="sm">
                                            🎮 인터랙티브 데모 →
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">{node.title}</h1>
                        </div>

                        {content ? (
                            <article className="prose prose-slate dark:prose-invert max-w-none">
                                {content}
                            </article>
                        ) : (
                            <div className="p-8 rounded-lg border bg-muted/50 text-center">
                                <p className="text-muted-foreground">콘텐츠 준비 중...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
