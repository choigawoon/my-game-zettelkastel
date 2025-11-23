'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, Trophy, Blocks, GitBranch } from 'lucide-react';

interface GraphNode {
    id: string;
    type: string;
    title: string;
    data: {
        icon: string;
        color: string;
        genre?: string;
        year?: string;
    };
}

interface GraphViewProps {
    graph: {
        nodes: GraphNode[];
        edges: Array<{
            source: string;
            target: string;
            type: string;
        }>;
    };
}

const iconMap: Record<string, any> = {
    Gamepad2,
    Trophy,
    Blocks,
    GitBranch,
};

export function GraphView({ graph }: GraphViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get root and category nodes
    const rootNode = graph.nodes.find(n => n.type === 'root');
    const categoryNodes = graph.nodes.filter(n => n.type === 'category');

    // Get children of selected category
    const getCategoryChildren = (categoryId: string) => {
        return graph.nodes.filter(node => {
            const edge = graph.edges.find(e => e.source === categoryId && e.target === node.id && e.type === 'part-of');
            return edge !== undefined;
        });
    };

    // Level 1: Overview - Show 3 main categories
    if (!selectedCategory) {
        return (
            <div className="w-full max-w-6xl mx-auto">
                <div className="relative" style={{ height: '600px' }}>
                    {/* Root node at center top */}
                    {rootNode && (
                        <div
                            className="absolute left-1/2 top-16 -translate-x-1/2"
                            style={{ zIndex: 10 }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 backdrop-blur">
                                    <Gamepad2 className="h-16 w-16 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-center">{rootNode.title}</h2>
                            </div>
                        </div>
                    )}

                    {/* 3 Category nodes in a row below */}
                    <div className="absolute left-0 right-0 top-64 flex justify-center gap-8 md:gap-12">
                        {categoryNodes.map((category) => {
                            const Icon = iconMap[category.data.icon];
                            const children = getCategoryChildren(category.id);
                            const colorMap: Record<string, string> = {
                                blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
                                green: 'from-green-500/20 to-green-500/5 border-green-500/30',
                                orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
                            };
                            const textColorMap: Record<string, string> = {
                                blue: 'text-blue-500',
                                green: 'text-green-500',
                                orange: 'text-orange-500',
                            };

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
                                >
                                    <div className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${colorMap[category.data.color]} border-2 backdrop-blur transition-all group-hover:shadow-xl`}>
                                        <Icon className={`h-16 md:h-20 w-16 md:w-20 ${textColorMap[category.data.color]}`} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg md:text-xl font-bold mb-1">{category.title}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {children.length}개 항목
                                        </Badge>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Connecting lines (SVG) */}
                    <svg
                        className="absolute inset-0 pointer-events-none w-full h-full"
                        style={{ zIndex: 1 }}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {categoryNodes.map((category, index) => {
                            // Use percentage-based positions for responsiveness
                            return (
                                <line
                                    key={category.id}
                                    x1="50%"
                                    y1="20%"
                                    x2={`${50 + (index - 1) * 25}%`}
                                    y2="55%"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    className="text-muted-foreground/30"
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    }

    // Level 2: Category Detail - Show nodes with connections
    const category = categoryNodes.find(c => c.id === selectedCategory);
    const children = getCategoryChildren(selectedCategory);

    if (!category) return null;

    const Icon = iconMap[category.data.icon];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedCategory(null)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    전체 보기
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                        <p className="text-sm text-muted-foreground">{children.length}개 항목</p>
                    </div>
                </div>
            </div>

            {/* Nodes in circular layout */}
            <div className="relative bg-muted/20 rounded-2xl p-8 md:p-12" style={{ minHeight: '500px' }}>
                {/* SVG for edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    {/* Draw edges between related nodes */}
                    {graph.edges
                        .filter(edge => {
                            const sourceNode = children.find(n => n.id === edge.source);
                            const targetNode = children.find(n => n.id === edge.target);
                            return sourceNode && targetNode;
                        })
                        .map((edge, idx) => {
                            const sourceIdx = children.findIndex(n => n.id === edge.source);
                            const targetIdx = children.findIndex(n => n.id === edge.target);

                            const centerX = 50;
                            const centerY = 50;
                            const radius = 35;
                            const angleSource = (sourceIdx / children.length) * 2 * Math.PI - Math.PI / 2;
                            const angleTarget = (targetIdx / children.length) * 2 * Math.PI - Math.PI / 2;

                            const x1 = centerX + radius * Math.cos(angleSource);
                            const y1 = centerY + radius * Math.sin(angleSource);
                            const x2 = centerX + radius * Math.cos(angleTarget);
                            const y2 = centerY + radius * Math.sin(angleTarget);

                            return (
                                <line
                                    key={`${edge.source}-${edge.target}-${idx}`}
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeDasharray={edge.type === 'relates-to' ? '4 4' : ''}
                                    className="text-primary/20"
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}
                </svg>

                {/* Nodes in circular arrangement */}
                <div className="relative w-full" style={{ height: '500px' }}>
                    {children.map((node, index) => {
                        const angle = (index / children.length) * 2 * Math.PI - Math.PI / 2;
                        // Position as percentage
                        const x = 50 + 35 * Math.cos(angle);
                        const y = 50 + 35 * Math.sin(angle);

                        return (
                            <Link
                                key={node.id}
                                href={`/learn/${node.id}`}
                                className="absolute group"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10,
                                }}
                            >
                                <div className="flex flex-col items-center gap-2 transition-all group-hover:scale-110">
                                    <div className="p-3 md:p-4 rounded-xl bg-card border-2 border-primary/20 shadow-lg backdrop-blur group-hover:border-primary/50 group-hover:shadow-xl">
                                        <div className="w-16 md:w-20 h-12 md:h-16 flex items-center justify-center">
                                            <div className="text-xs md:text-sm font-bold text-center break-words max-w-[80px] md:max-w-[100px]">
                                                {node.title}
                                            </div>
                                        </div>
                                    </div>
                                    {node.data.genre && (
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap">
                                            {node.data.genre}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
