import { RoadRow } from "../types";
import { all } from "../sqlite";

export async function getAllRoads(): Promise<RoadRow[]> {
    return all<RoadRow>(
        `SELECT id, from_id, to_id, distance_km, travel_time_min
         FROM roads
         ORDER BY id`
    );
}

export async function getRoadsByLocationId(locationId: number): Promise<RoadRow[]> {
    return all<RoadRow>(
        `SELECT id, from_id, to_id, distance_km, travel_time_min
         FROM roads
         WHERE from_id = ? OR to_id = ?
         ORDER BY id`,
        [locationId, locationId]
    );
}
