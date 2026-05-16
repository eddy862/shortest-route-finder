import { describe, it, expect } from "vitest";
import { getReachableNodeIds, isReachable } from "../../src/graph/reachability";
import type { Graph } from "../../src/graph/types";

const graph: Graph = {
    1: [{ to: 2, distanceKm: 1, travelTimeMin: 1 }],
    2: [
        { to: 1, distanceKm: 1, travelTimeMin: 1 },
        { to: 3, distanceKm: 1, travelTimeMin: 1 },
    ],
    3: [{ to: 2, distanceKm: 1, travelTimeMin: 1 }],
    4: [], // disconnected node
};

describe("Reachability", () => {
    it("should return all reachable node IDs from a given start node", () => {
        const reachable = getReachableNodeIds(graph, 1);

        expect(reachable.has(1)).toBe(true);
        expect(reachable.has(2)).toBe(true);
        expect(reachable.has(3)).toBe(true);
        expect(reachable.has(4)).toBe(false);
        expect(reachable.size).toBe(3);
    });

    it("should return empty set if start node not exists", () => {
        const reachable = getReachableNodeIds(graph, 999);
        expect(reachable.size).toBe(0);
    });

    it("isReachable should return true for reachable nodes", () => {
        expect(isReachable(graph, 1, 3)).toBe(true);
    });

    it("isReachable should return false for unreachable nodes", () => {
        expect(isReachable(graph, 1, 4)).toBe(false);
    });

    it("isReachable handles same start and end node", () => {
        expect(isReachable(graph, 1, 1)).toBe(true);
        expect(isReachable(graph, 999, 999)).toBe(false);
    });
});