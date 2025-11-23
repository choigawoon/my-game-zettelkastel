import Link from 'next/link';
import { getGraph } from '@/lib/content';
import { ArrowRight, Gamepad2, Trophy, Blocks, GitBranch, Repeat } from 'lucide-react';

const iconMap: Record<string, any> = {
    Gamepad2,
    Trophy,
    Blocks,
    GitBranch,
    Repeat,
};

export function GraphView() {
    const graph = getGraph();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {graph.nodes.map((node) => {
                const Icon = iconMap[node.data.icon] || Gamepad2;
                return (
                    <Link
                        key={node.id}
                        href={`/learn/${node.id}`}
                        className={`block p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-1
              ${node.type === 'root' ? 'border-purple-200 bg-purple-50' :
                                node.type === 'category' ? 'border-blue-200 bg-blue-50' :
                                    'border-gray-200 bg-white'}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${node.type === 'root' ? 'bg-purple-100 text-purple-600' :
                                    node.type === 'category' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-100 text-gray-600'
                                }`}>
                                <Icon size={24} />
                            </div>
                            <ArrowRight className="text-gray-400" size={20} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{node.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{node.type}</p>
                    </Link>
                );
            })}
        </div>
    );
}
