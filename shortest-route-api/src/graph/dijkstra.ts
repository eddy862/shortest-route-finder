import { Graph } from "./types";

export interface ShortestPathResult {
    path: number[];
    totalDistanceKm: number | null;
    reachable: boolean;
}

export function dijkstra(
    graph: Graph,
    fromId: number,
    toId: number
): ShortestPathResult {
    // if either the starting or ending location doesn't exist in the graph, return unreachable
    if (!graph[fromId] || !graph[toId]) {
        return { path: [], totalDistanceKm: null, reachable: false };
    }

    if (fromId === toId) {
        return { path: [fromId], totalDistanceKm: 0, reachable: true };
    }

    const distances = new Map<number, number>(); // use map to track shortest distance to each node
    const previous = new Map<number, number | null>(); // use map to track previous node in the optimal path
    const visited = new Set<number>();

    for (const nodeId of Object.keys(graph).map(Number)) {
        distances.set(nodeId, Infinity);
        previous.set(nodeId, null);
    }
    distances.set(fromId, 0);

    // how dijkstra's algorithm works:
    // 1. find the unvisited node with the smallest distance (starting with fromId)
    // 2. for each of its neighbors, calculate the distance through this node and update if it's smaller than the previously known distance
    // 3. mark the current node as visited and repeat until we visit toId or exhaust all reachable nodes
    // then we can reconstruct the path from toId back to fromId using the previous map

    while (visited.size < Object.keys(graph).length) {
        // find the unvisited node with the smallest distance
        let currentNodeId: number | null = null;
        let smallestDistance = Infinity;
        for (const [nodeId, distance] of distances) {
            if (!visited.has(nodeId) && distance < smallestDistance) {
                smallestDistance = distance;
                currentNodeId = nodeId;
            }
        }

        if (currentNodeId === null) {
            break; // all remaining unvisited nodes are unreachable
        }

        if (currentNodeId === toId) {
            break; // we reached the destination
        }

        visited.add(currentNodeId);

        const neighbors = graph[currentNodeId] || [];

        for (const edge of neighbors) {
            if (visited.has(edge.to)) {
                continue; // skip visited neighbors
            }
            const newDistance = (distances.get(currentNodeId) ?? Infinity) + edge.distanceKm;
            if (newDistance < (distances.get(edge.to) ?? Infinity)) {
                distances.set(edge.to, newDistance);
                previous.set(edge.to, currentNodeId);
            }
        }
    }

    // if the final distance to toId is still Infinity, it means it's unreachable
    const finalDistance = distances.get(toId) ?? Infinity;
    if (!Number.isFinite(finalDistance)) {
        return { path: [], totalDistanceKm: null, reachable: false };
    }

    // reconstruct the path from toId back to fromId
    const path: number[] = [];
    let current: number | null = toId;
    while (current !== null) {
        path.unshift(current); // add to the front of the path
        current = previous.get(current) ?? null;
    }

    return {
        path,
        totalDistanceKm: Number(finalDistance.toFixed(2)), 
        reachable: true
    };
}