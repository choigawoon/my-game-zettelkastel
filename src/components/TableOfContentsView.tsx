'use client'

import { useState } from 'react';
import Link from 'next/link';
import { getGraph } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Circle, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, any> = {
    ...LucideIcons,
    Circle,
};

interface TableOfContentsViewProps {
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

export function TableOfContentsView({ graph }: TableOfContentsViewProps) {

    // Group nodes by type
    const nodesByType = graph.nodes.reduce((acc, node) => {
        if (!acc[node.type]) acc[node.type] = [];
        acc[node.type].push(node);
        return acc;
    }, {} as Record<string, typeof graph.nodes>);

    // Category nodes and their children
    const categories = nodesByType.category || [];
    const getCategoryChildren = (categoryId: string) => {
        return graph.nodes.filter(node => {
            const edge = graph.edges.find(e => e.source === categoryId && e.target === node.id && e.type === 'part-of');
            return edge !== undefined;
        });
    };

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        cases: true,
        fundamentals: true,
        decisions: true,
    });

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Main node */}
            {nodesByType.root && nodesByType.root.map(node => {
                const Icon = iconMap[node.data.icon] || Circle;
                return (
                    <div key={node.id} className="p-6 rounded-lg border-2 border-primary/50 bg-card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Icon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{node.title}</h1>
                                <Badge variant="default" className="mt-2">
                                    {getNodeTypeLabel(node.type)}
                                </Badge>
                            </div>
                            <Link href={`/learn/${node.id}`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
            })}

            {/* Categories with children */}
            {categories.map(category => {
                const children = getCategoryChildren(category.id);
                const Icon = iconMap[category.data.icon] || Circle;
                const isOpen = openSections[category.id] ?? true;

                return (
                    <Collapsible key={category.id} open={isOpen} onOpenChange={() => toggleSection(category.id)}>
                        <div className="rounded-lg border bg-card">
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-bold">{category.title}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {children.length}개 항목
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {getNodeTypeLabel(category.type)}
                                    </Badge>
                                    {isOpen ? (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="border-t">
                                    {children.map((child, index) => {
                                        const ChildIcon = iconMap[child.data.icon] || Circle;
                                        return (
                                            <Link
                                                key={child.id}
                                                href={`/learn/${child.id}`}
                                                className={`flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors ${index !== children.length - 1 ? 'border-b' : ''
                                                    }`}
                                            >
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <ChildIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{child.title}</div>
                                                    {child.data.genre && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {child.data.genre} · {child.data.year}
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {getNodeTypeLabel(child.type)}
                                                </Badge>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                );
            })}
        </div>
    );
}
