import { getAllLocations } from "../db/queries/locations.repo";
import { getAllRoads } from "../db/queries/roads.repo";
import { Graph } from "./types";

export async function buildGraph(): Promise<Graph> {
    const [locations, roads] = await Promise.all([
        getAllLocations(),
        getAllRoads()
    ]);

    const graph: Graph = {};

    // Initialize the graph with all locations
    for (const location of locations) {
        graph[location.id] = [];
    }

    // Add bidirectional edges to the graph based on the roads
    for (const road of roads) {
        if (!graph[road.from_id]) graph[road.from_id] = [];
        if (!graph[road.to_id]) graph[road.to_id] = [];

        graph[road.from_id].push({
            to: road.to_id,
            distanceKm: road.distance_km,
            travelTimeMin: road.travel_time_min
        });

        graph[road.to_id].push({
            to: road.from_id,
            distanceKm: road.distance_km,
            travelTimeMin: road.travel_time_min
        });
    }

    return graph;
}