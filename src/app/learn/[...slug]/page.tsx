import { getContent, getAllNodeIds, getNode } from '@/lib/content';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';

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

    return (
        <div className="max-w-3xl mx-auto py-10 px-6">
            <h1 className="text-4xl font-bold mb-4">{node.title}</h1>
            <div className="flex gap-2 mb-8">
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${node.data.color}-100 text-${node.data.color}-800`}>
                    {node.type}
                </span>
            </div>

            {content ? (
                <article className="prose lg:prose-xl">
                    {content}
                </article>
            ) : (
                <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-500">Content coming soon...</p>
                </div>
            )}
        </div>
    );
}
