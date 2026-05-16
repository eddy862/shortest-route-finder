import { createDelivery, CreateDeliveryInput, getDeliveryById, getDeliverySummaryByCustomer, updateDeliveryStatusToArrived } from "../db/queries/deliveries.repo";
import { getDepotLocation, getLocationById } from "../db/queries/locations.repo";
import { HttpError } from "../utils/httpError";
import { isReachableFromDepot } from "./route.service";

export interface CreateDeliveryRequest {
    customer_id: number;
    truck_plate: string;
}

export interface UpdateDeliveryStatusInput {
    delivery_id: number;
    status: string;
}

export async function getDeliverySummary() {
    return getDeliverySummaryByCustomer();
}

export async function markDeliveryArrived(input: UpdateDeliveryStatusInput) {
    const { delivery_id, status } = input;

    const delivery = await getDeliveryById(delivery_id);
    if (!delivery) {
        throw new HttpError(
            404,
            "NOT_FOUND",
            `Delivery with id ${delivery_id} not found`,
            [{
                field: "delivery_id",
                issue: "delivery not found"
            }]
        );
    }

    if (status !== "arrived") {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Invalid status value: ${status}. Only "arrived" is allowed.`,
            [{
                field: "status",
                issue: "invalid status value"
            }]
        );
    }

    if (delivery.status !== "departed") {
        throw new HttpError(
            422,
            "UNPROCESSABLE_STATE",
            `Invalid delivery status transition. Current status: ${delivery.status}. Only deliveries with "departed" status can be marked as "arrived".`,
            [{
                field: "delivery_id",
                issue: `invalid delivery status transition`
            }]
        );
    }

    const updated = await updateDeliveryStatusToArrived(delivery_id);
    
    return updated;
}

export async function createDeliveryDepature(input: CreateDeliveryRequest) {
    const { customer_id, truck_plate } = input;

    const customer = await getLocationById(customer_id);
    if (!customer) {
        throw new HttpError(
            404,
            "NOT_FOUND",
            `Customer with id ${customer_id} not found`,
            [{
                field: "customer_id",
                issue: "customer not found"
            }]
        );
    }

    if (customer.type !== "customer") {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Location with id ${customer_id} is not a customer`,
            [{
                field: "customer_id",
                issue: "location is not a customer"
            }]
        );
    }

    const depot = await getDepotLocation();
    if (!depot) {
        throw new HttpError(
            500,
            "INTERNAL_ERROR",
            "Depot location not found in the system"
        );
    }

    const reachable = await isReachableFromDepot(depot.id, customer_id);
    if (!reachable) {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Customer with id ${customer_id} is not reachable from the depot`,
            [{
                field: "customer_id",
                issue: "customer not reachable from depot"
            }]
        );
    }

    const payload: CreateDeliveryInput = {
        customer_id,
        truck_plate,
        status: "departed"
    };

    return createDelivery(payload);
}

