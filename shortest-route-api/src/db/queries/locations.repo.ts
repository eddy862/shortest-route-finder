import { LocationRow, LocationWithRoadCountRow } from "../types";
import { all, get } from "../sqlite";

export async function getLocationById(id: number): Promise<LocationRow | null> {
    const row = await get<LocationRow>(
        `SELECT id, name, type
         FROM locations
         WHERE id = ?`,
        [id]
    );
    return row ?? null;
}

export async function getDepotLocation(): Promise<LocationRow | null> {
    const row = await get<LocationRow>(
        `SELECT id, name, type
         FROM locations
         WHERE type = 'depot'
         LIMIT 1`
    );
    return row ?? null;
}

export async function getAllLocations(): Promise<LocationRow[]> {
    return all<LocationRow>(
        `SELECT id, name, type
         FROM locations
         ORDER BY id`
    );
}

export async function getAllLocationsWithRoadCount() : Promise<LocationWithRoadCountRow[]> {
    return all<LocationWithRoadCountRow>(
        `SELECT
            l.id,
            l.name,
            l.type,
            COUNT(r.id) AS road_count
         FROM locations l
         LEFT JOIN roads r
            ON l.id = r.from_id OR l.id = r.to_id
         GROUP BY l.id, l.name, l.type
         ORDER BY l.id`
    );
}

export async function getCustomerLocations(): Promise<LocationRow[]> {
    return all<LocationRow>(
        `SELECT id, name, type
         FROM locations
         WHERE type = 'customer'
         ORDER BY id`
    );
}
