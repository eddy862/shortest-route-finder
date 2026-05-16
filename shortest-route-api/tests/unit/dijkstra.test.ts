import { describe, it, expect} from "vitest"
import { dijkstra } from "../../src/graph/dijkstra"
import { Graph } from "../../src/graph/types"

const graph: Graph = {
    1: [
        { to: 2, distanceKm: 5, travelTimeMin: 8 },
        { to: 3, distanceKm: 2, travelTimeMin: 4 },
    ],
    2: [
        { to: 1, distanceKm: 5, travelTimeMin: 8 },
        { to: 4, distanceKm: 2, travelTimeMin: 3 },
    ],
    3: [
        { to: 1, distanceKm: 2, travelTimeMin: 4 },
        { to: 4, distanceKm: 10, travelTimeMin: 12 },
    ],
    4: [
        { to: 2, distanceKm: 2, travelTimeMin: 3 },
        { to: 3, distanceKm: 10, travelTimeMin: 12 },
    ],
    5: [], // isolated
}

describe("Dijkstra's algorithm", () => {
    it("should find the shortest path by distance", () => {
        const result = dijkstra(graph, 1, 4);

        expect(result.reachable).toBe(true);
        expect(result.path).toEqual([1, 2, 4]);
        expect(result.totalDistanceKm).toBe(7);
    })

    it("should return unreachable for isolated nodes", () => {
        const result = dijkstra(graph, 1, 5);

        expect(result.reachable).toBe(false);
        expect(result.path).toEqual([]);
        expect(result.totalDistanceKm).toBeNull();
    })

    it("should return zero distance for same start and end node", () => {
        const result = dijkstra(graph, 1, 1);

        expect(result.reachable).toBe(true);
        expect(result.path).toEqual([1]);
        expect(result.totalDistanceKm).toBe(0);
    })

    it("should return unreachable for non-existent nodes", () => {
        const result = dijkstra(graph, 1, 999);

        expect(result.reachable).toBe(false);
        expect(result.path).toEqual([]);
        expect(result.totalDistanceKm).toBeNull();
    })
})