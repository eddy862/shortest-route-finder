export type LocationType = "depot" | "customer";
export type DeliveryStatus = "departed" | "arrived";

export interface LocationRow {
    id: number;
    name: string;
    type: LocationType;
}

// for GET /locations endpoint, we want to include the number of roads connected to each location
export interface LocationWithRoadCountRow extends LocationRow {
    road_count: number;
}

export interface RoadRow {
    id: number;
    from_id: number;
    to_id: number;
    distance_km: number;
    travel_time_min: number;
}

export interface DeliveryRow {
    id: number;
    customer_id: number;
    truck_plate: string;
    status: DeliveryStatus;
    departed_at: string;
    arrived_at: string | null;
}

// for GET /deliveries/summary endpoint, we want to include the customer name and the total number of deliveries for each customer
export interface DeliverySummaryRow {
    customer_id: number;
    customer_name: string;
    total_deliveries: number;
    most_recent_delivery_at: string | null;
}