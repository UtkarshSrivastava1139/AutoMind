import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '60',
};

export async function getLayoutedElements(nodes: any[], edges: any[], direction = 'RIGHT') {
  const isHorizontal = direction === 'RIGHT';
  
  const graph = {
    id: 'root',
    layoutOptions: {
      ...layoutOptions,
      'elk.direction': direction,
    },
    children: nodes.map((node) => ({
      ...node,
      // Target width/height of standard circular nodes
      width: 40,
      height: 40,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);
  
  if (!layoutedGraph.children) {
    return { nodes, edges };
  }

  const layoutedNodes = nodes.map((node) => {
    const layoutNode = layoutedGraph.children!.find((n) => n.id === node.id);
    if (!layoutNode) return node;

    // We get center coords? No, ELK usually gives top-left. 
    // React Flow nodes typically use top-left, but we offset if needed.
    return {
      ...node,
      position: { x: layoutNode.x!, y: layoutNode.y! },
    };
  });

  return { nodes: layoutedNodes, edges };
}
