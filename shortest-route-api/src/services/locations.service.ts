import { getAllLocationsWithRoadCount, getCustomerLocations, getDepotLocation } from "../db/queries/locations.repo";
import { buildGraph } from "../graph/buildGraph";
import { getReachableNodeIds } from "../graph/reachability";
import { HttpError } from "../utils/httpError";
import { isReachableFromDepot } from "./route.service";

export interface UnreachableLocationItem {
    id: number;
    name: string;
    type: "customer";
}

export async function listUnreachableLocations(): Promise<UnreachableLocationItem[]> {
    const [depot, customers, graph] = await Promise.all([
        getDepotLocation(),
        getCustomerLocations(),
        buildGraph()
    ]);

    if (!depot) {
        throw new HttpError(
            500,
            "INTERNAL_ERROR",
            "Depot location not found in database"
        );
    }

    const reachable = getReachableNodeIds(graph, depot.id);

    return customers
        .filter(customer => !reachable.has(customer.id))
        .map(customer => ({
            id: customer.id,
            name: customer.name,
            type: "customer"
        })
        );
}

export async function listLocations() {
    return getAllLocationsWithRoadCount();
}