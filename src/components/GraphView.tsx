import Link from 'next/link';
import { ArrowRight, Gamepad2, Trophy, Blocks, GitBranch, Repeat, Cog, Database, Eye, Zap, Wifi, Network, RefreshCw, Clock, Scale, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, any> = {
    Gamepad2, Trophy, Blocks, GitBranch, Repeat, Cog, Database, Eye, Zap, Wifi, Network, RefreshCw, Clock, Scale, Circle,
};

interface GraphViewProps {
    graph: {
        nodes: Array<{
            id: string;
            type: string;
            title: string;
            data: {
                icon: string;
                color: string;
                genre?: string;
                year?: string;
            };
        }>;
        edges: Array<{
            source: string;
            target: string;
            type: string;
        }>;
    };
}

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

export function GraphView({ graph }: GraphViewProps) {
    // Group nodes by type
    const nodesByType = graph.nodes.reduce((acc, node) => {
        if (!acc[node.type]) acc[node.type] = [];
        acc[node.type].push(node);
        return acc;
    }, {} as Record<string, typeof graph.nodes>);

    // Order: root, category, case, fundamental, decision
    const typeOrder = ['root', 'category', 'case', 'fundamental', 'decision'];

    return (
        <div className="space-y-12">
            {typeOrder.map(type => {
                const nodes = nodesByType[type];
                if (!nodes || nodes.length === 0) return null;

                return (
                    <section key={type} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold">{getNodeTypeLabel(type)}</h2>
                            <Badge variant="secondary">{nodes.length}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {nodes.map((node) => {
                                const Icon = iconMap[node.data.icon] || Circle;
                                return (
                                    <Link key={node.id} href={`/learn/${node.id}`}>
                                        <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer">
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <Icon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <CardTitle className="text-lg">{node.title}</CardTitle>
                                                {node.data.genre && (
                                                    <CardDescription>
                                                        {node.data.genre} · {node.data.year}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
