export interface GraphEdge {
    to: number;
    distanceKm: number;
    travelTimeMin: number;
}

export type Graph = Record<number, GraphEdge[]>; // Adjacency list representation of the graph, e.g., { locationId: [{ to: locationId, distanceKm: number, travelTimeMin: number }, ...] }