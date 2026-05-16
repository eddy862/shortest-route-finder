import { getAllLocations, getLocationById } from "../db/queries/locations.repo";
import { buildGraph } from "../graph/buildGraph";
import { dijkstra } from "../graph/dijkstra";
import { HttpError } from "../utils/httpError";

export interface RoutePathNode {
    id: number;
    name: string;
}

export interface FindShortestRouteResponse {
    from: RoutePathNode;
    to: RoutePathNode;
    path: RoutePathNode[];
    total_distance_km: number | null;
    reachable: boolean;
}

export async function findShortestRoute(fromId: number, toId: number): Promise<FindShortestRouteResponse> {
    const [fromLocation, toLocation] = await Promise.all([
        getLocationById(fromId),
        getLocationById(toId)
    ]);

    if (!fromLocation) {
        throw new HttpError(
            404,
            "NOT_FOUND",
            `Location with id ${fromId} not found`,
            [{
                field: "from",
                issue: "Location not found"
            }]
        )
    }

    if (!toLocation) {
        throw new HttpError(
            404,
            "NOT_FOUND",
            `Location with id ${toId} not found`,
            [{
                field: "to",
                issue: "Location not found"
            }]
        )
    }

    const [graph, allLocations] = await Promise.all([
        buildGraph(),
        getAllLocations()
    ]);

    const locationNameById = new Map<number, string>();
    for (const loc of allLocations) {
        locationNameById.set(loc.id, loc.name);
    }

    const result = dijkstra(graph, fromId, toId);

    const path: RoutePathNode[] = result.path.map(id => ({
        id,
        name: locationNameById.get(id) ?? `Unknown Location ${id}`
    }));

    return {
        from: { id: fromLocation.id, name: fromLocation.name },
        to: { id: toLocation.id, name: toLocation.name },
        path,
        total_distance_km: result.totalDistanceKm,
        reachable: result.reachable
    }
}

export async function isReachable(fromId: number, toId: number): Promise<boolean> {
    const graph = await buildGraph();
    const result = dijkstra(graph, fromId, toId);
    return result.reachable;
}