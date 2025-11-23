import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const NODES_DIR = path.join(CONTENT_DIR, 'nodes');
const GRAPH_FILE = path.join(CONTENT_DIR, 'graph.yaml');

export interface NodeData {
  icon: string;
  color: string;
}

export interface Node {
  id: string;
  type: 'root' | 'category' | 'concept' | 'topic';
  title: string;
  data: NodeData;
}

export interface Edge {
  source: string;
  target: string;
  type: string;
  style?: string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface ContentFile {
  id: string;
  content: string;
  frontmatter: Record<string, any>;
}

export function getGraph(): Graph {
  const fileContents = fs.readFileSync(GRAPH_FILE, 'utf8');
  return yaml.load(fileContents) as Graph;
}

export function getNode(id: string): Node | undefined {
  const graph = getGraph();
  return graph.nodes.find((node) => node.id === id);
}

export function getContent(id: string): ContentFile | null {
  const filePath = path.join(NODES_DIR, `${id}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(fileContents);
  
  return {
    id,
    content,
    frontmatter: data,
  };
}

export function getAllNodeIds(): string[] {
  const graph = getGraph();
  return graph.nodes.map((node) => node.id);
}
