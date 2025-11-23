import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read ko.json from the old repo
const koJsonPath = path.join(__dirname, '../../how-to-make-a-game/src/locales/ko.json');
const koData = JSON.parse(fs.readFileSync(koJsonPath, 'utf8'));

// Extract course data
const courseData = koData.course;

// Build nodes array
const nodes = [];
const edges = [];

// Add main node
nodes.push({
    id: 'main',
    type: 'root',
    title: courseData.main.title,
    data: {
        icon: 'Gamepad2',
        color: 'purple'
    }
});

// Add category nodes
const categories = ['cases', 'fundamentals', 'decisions'];
const categoryIcons = {
    cases: 'Trophy',
    fundamentals: 'Blocks',
    decisions: 'GitBranch'
};
const categoryColors = {
    cases: 'blue',
    fundamentals: 'green',
    decisions: 'orange'
};

for (const cat of categories) {
    nodes.push({
        id: cat,
        type: 'category',
        title: courseData.layers[cat].title,
        data: {
            icon: categoryIcons[cat],
            color: categoryColors[cat]
        }
    });

    // Add edge from main to category
    edges.push({
        source: 'main',
        target: cat,
        type: 'structure'
    });
}

// Add cross-category edges
edges.push(
    { source: 'cases', target: 'fundamentals', type: 'related', style: 'dashed' },
    { source: 'cases', target: 'decisions', type: 'related', style: 'dashed' },
    { source: 'fundamentals', target: 'decisions', type: 'related', style: 'dashed' }
);

// Add case nodes
const caseGames = Object.keys(courseData.cases).filter(key => key !== 'cases-center');
for (const gameId of caseGames) {
    const game = courseData.cases[gameId];
    nodes.push({
        id: gameId,
        type: 'case',
        title: game.title,
        data: {
            icon: 'Trophy',
            color: 'blue',
            genre: game.genre,
            year: game.year
        }
    });

    edges.push({
        source: 'cases',
        target: gameId,
        type: 'part-of'
    });
}

// Add fundamental nodes
const fundamentalTopics = Object.keys(courseData.fundamentals).filter(key => key !== 'fundamentals-center');
const fundamentalIcons = {
    'modeling-simulation': 'Cog',
    'game-loop': 'Repeat',
    'serialization': 'Database',
    'rendering': 'Eye',
    'physics': 'Zap',
    'networking': 'Wifi'
};

for (const topicId of fundamentalTopics) {
    const topic = courseData.fundamentals[topicId];
    nodes.push({
        id: topicId,
        type: 'fundamental',
        title: topic.title,
        data: {
            icon: fundamentalIcons[topicId] || 'Circle',
            color: 'green'
        }
    });

    edges.push({
        source: 'fundamentals',
        target: topicId,
        type: 'part-of'
    });
}

// Add decision nodes
const decisionTopics = Object.keys(courseData.decisions).filter(key => key !== 'decisions-center');
const decisionIcons = {
    'multiplayer-arch': 'Network',
    'physics-authority': 'Zap',
    'sync-strategy': 'RefreshCw',
    'tickrate': 'Clock',
    'balancing': 'Scale'
};

for (const topicId of decisionTopics) {
    const topic = courseData.decisions[topicId];
    nodes.push({
        id: topicId,
        type: 'decision',
        title: topic.title,
        data: {
            icon: decisionIcons[topicId] || 'Circle',
            color: 'orange'
        }
    });

    edges.push({
        source: 'decisions',
        target: topicId,
        type: 'part-of'
    });
}

// Generate YAML manually (instead of using a library for simplicity)
let yaml = 'nodes:\n';
for (const node of nodes) {
    yaml += `  - id: "${node.id}"\n`;
    yaml += `    type: "${node.type}"\n`;
    yaml += `    title: "${node.title}"\n`;
    yaml += `    data:\n`;
    yaml += `      icon: "${node.data.icon}"\n`;
    yaml += `      color: "${node.data.color}"\n`;
    if (node.data.genre) yaml += `      genre: "${node.data.genre}"\n`;
    if (node.data.year) yaml += `      year: "${node.data.year}"\n`;
}

yaml += '\nedges:\n';
for (const edge of edges) {
    yaml += `  - source: "${edge.source}"\n`;
    yaml += `    target: "${edge.target}"\n`;
    yaml += `    type: "${edge.type}"\n`;
    if (edge.style) yaml += `    style: "${edge.style}"\n`;
}

// Write to file
const outputPath = path.join(__dirname, '../content/graph.yaml');
fs.writeFileSync(outputPath, yaml, 'utf8');

console.log(`Generated graph.yaml with ${nodes.length} nodes and ${edges.length} edges`);
console.log('Nodes:', nodes.map(n => n.id).join(', '));
