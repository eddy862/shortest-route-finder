import { Graph } from "./types";

export function getReachableNodeIds(graph: Graph, startId: number): Set<number> {
    const visited = new Set<number>();

    if (!graph[startId]) {
        return visited;
    }

    const stack: number[] = [startId];

    // Depth-first search (DFS) to find all reachable nodes
    // how it works:
    // 1. Start with the initial node (startId) and add it to the stack.
    // 2. While the stack is not empty, pop a node from the stack.
    // 3. If the node has already been visited, skip it. Otherwise, mark it as visited.
    // 4. For each edge from the current node, if the destination node has not been visited, push it onto the stack.
    // 5. Repeat until the stack is empty. The visited set will contain all reachable node IDs from the startId.
    while (stack.length > 0) {
        const nodeId = stack.pop()!;
        if (visited.has(nodeId)) continue;

        visited.add(nodeId);

        for (const edge of graph[nodeId] ?? []) {
            if (!visited.has(edge.to)) {
                stack.push(edge.to);
            }
        }
    }

    return visited;
}

export function isReachable(graph: Graph, fromId: number, toId: number): boolean {
    if (fromId === toId) return Boolean(graph[fromId]);

    const reachable = getReachableNodeIds(graph, fromId);
    return reachable.has(toId);
}