import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read ko.json from the old repo
const koJsonPath = path.join(__dirname, '../../how-to-make-a-game/src/locales/ko.json');
const koData = JSON.parse(fs.readFileSync(koJsonPath, 'utf8'));

const courseData = koData.course;
const nodesDir = path.join(__dirname, '../content/nodes');

// Ensure nodes directory exists
if (!fs.existsSync(nodesDir)) {
    fs.mkdirSync(nodesDir, { recursive: true });
}

// Helper function to generate MDX frontmatter
function generateFrontmatter(data) {
    const fm = ['---'];
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            fm.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
        } else if (Array.isArray(value)) {
            fm.push(`${key}:`);
            value.forEach(v => fm.push(`  - "${v.replace(/"/g, '\\"')}"`));
        } else {
            fm.push(`${key}: ${JSON.stringify(value)}`);
        }
    }
    fm.push('---');
    return fm.join('\n');
}

// Generate category MDX files
const categories = ['main', 'cases', 'fundamentals', 'decisions'];
for (const catId of categories) {
    const catData = catId === 'main' ? courseData.main : courseData.layers[catId];
    const frontmatter = generateFrontmatter({
        title: catData.title,
        description: catData.description
    });

    const content = `${frontmatter}

# ${catData.title}

${catData.description}
`;

    fs.writeFileSync(path.join(nodesDir, `${catId}.mdx`), content);
    console.log(`Generated ${catId}.mdx`);
}

// Generate case study MDX files
const caseGames = Object.keys(courseData.cases).filter(key => key !== 'cases-center');
for (const gameId of caseGames) {
    const game = courseData.cases[gameId];
    const frontmatter = generateFrontmatter({
        title: game.title,
        description: game.description,
        genre: game.genre,
        year: game.year,
        keyFeatures: game.keyFeatures || [],
        fundamentals: game.fundamentals || [],
        decisions: game.decisions || []
    });

    let content = `${frontmatter}

# ${game.title}

${game.description}

## 게임 정보

- **장르**: ${game.genre}
- **출시**: ${game.year}

`;

    if (game.keyFeatures && game.keyFeatures.length > 0) {
        content += `## 핵심 특징\n\n`;
        game.keyFeatures.forEach(feature => {
            content += `- ${feature}\n`;
        });
        content += `\n`;
    }

    if (game.fundamentals && game.fundamentals.length > 0) {
        content += `## 관련 기본 원리\n\n`;
        game.fundamentals.forEach(f => {
            content += `- ${f}\n`;
        });
        content += `\n`;
    }

    if (game.decisions && game.decisions.length > 0) {
        content += `## 관련 설계 결정\n\n`;
        game.decisions.forEach(d => {
            content += `- ${d}\n`;
        });
    }

    fs.writeFileSync(path.join(nodesDir, `${gameId}.mdx`), content);
    console.log(`Generated ${gameId}.mdx`);
}

// Generate fundamental topic MDX files
const fundamentalTopics = Object.keys(courseData.fundamentals).filter(key => key !== 'fundamentals-center');
for (const topicId of fundamentalTopics) {
    const topic = courseData.fundamentals[topicId];

    const frontmatter = generateFrontmatter({
        title: topic.title,
        description: topic.description
    });

    let content = `${frontmatter}

# ${topic.title}

${topic.description}

`;

    if (topic.concepts && topic.concepts.length > 0) {
        content += `## 핵심 개념\n\n`;
        topic.concepts.forEach(concept => {
            content += `- ${concept}\n`;
        });
        content += `\n`;
    }

    if (topic.usedIn && topic.usedIn.length > 0) {
        content += `## 활용 분야\n\n`;
        topic.usedIn.forEach(use => {
            content += `- ${use}\n`;
        });
        content += `\n`;
    }

    // Add special content for modeling-simulation (game loop details)
    if (topicId === 'modeling-simulation' && topic.gameLoop) {
        content += `## ${topic.gameLoop.title}\n\n${topic.gameLoop.description}\n\n`;

        if (topic.gameLoop.tickStructure) {
            content += `### ${topic.gameLoop.tickStructure.title}\n\n${topic.gameLoop.tickStructure.description}\n\n`;
            if (topic.gameLoop.tickStructure.phases) {
                topic.gameLoop.tickStructure.phases.forEach(phase => {
                    content += `#### ${phase.name}\n\n${phase.description}\n\n`;
                });
            }
        }
    }

    fs.writeFileSync(path.join(nodesDir, `${topicId}.mdx`), content);
    console.log(`Generated ${topicId}.mdx`);
}

// Generate decision topic MDX files
const decisionTopics = Object.keys(courseData.decisions).filter(key => key !== 'decisions-center');
for (const topicId of decisionTopics) {
    const topic = courseData.decisions[topicId];

    const frontmatter = generateFrontmatter({
        title: topic.title,
        description: topic.description
    });

    let content = `${frontmatter}

# ${topic.title}

${topic.description}

`;

    if (topic.considerations && topic.considerations.length > 0) {
        content += `## 결정 시 고려사항\n\n`;
        topic.considerations.forEach(c => {
            content += `- ${c}\n`;
        });
        content += `\n`;
    }

    if (topic.options) {
        content += `## 선택지\n\n`;
        for (const [optionKey, option] of Object.entries(topic.options)) {
            content += `### ${option.name}\n\n`;

            if (option.pros && option.pros.length > 0) {
                content += `**장점**:\n`;
                option.pros.forEach(pro => content += `- ${pro}\n`);
                content += `\n`;
            }

            if (option.cons && option.cons.length > 0) {
                content += `**단점**:\n`;
                option.cons.forEach(con => content += `- ${con}\n`);
                content += `\n`;
            }

            if (option.useCases && option.useCases.length > 0) {
                content += `**사용 사례**:\n`;
                option.useCases.forEach(uc => content += `- ${uc}\n`);
                content += `\n`;
            }
        }
    }

    // Add case studies if available
    if (topic.caseStudies && topic.caseStudies.items) {
        content += `## 의사결정 사례 연구\n\n`;
        topic.caseStudies.items.forEach(study => {
            content += `### ${study.title}\n\n`;
            if (study.problem) content += `**문제**: ${study.problem}\n\n`;
            if (study.decision) content += `**결정**: ${study.decision}\n\n`;
            if (study.result) content += `**결과**: ${study.result}\n\n`;
        });
    }

    fs.writeFileSync(path.join(nodesDir, `${topicId}.mdx`), content);
    console.log(`Generated ${topicId}.mdx`);
}

console.log('\n✅ All MDX files generated successfully!');
