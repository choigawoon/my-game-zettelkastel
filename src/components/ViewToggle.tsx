'use client'

import { useState } from 'react';
import { GraphView } from '@/components/GraphView';
import { TableOfContentsView } from '@/components/TableOfContentsView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
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

export function ViewToggle({ graph }: ViewToggleProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <>
            {/* View Toggle */}
            <div className="flex justify-center mb-6">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
                    <ToggleGroupItem value="grid" aria-label="그리드 뷰">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        지식 그래프
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="목차 뷰">
                        <List className="h-4 w-4 mr-2" />
                        목차
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Conditional rendering based on view mode */}
            {viewMode === 'grid' ? <GraphView graph={graph} /> : <TableOfContentsView graph={graph} />}
        </>
    );
}
