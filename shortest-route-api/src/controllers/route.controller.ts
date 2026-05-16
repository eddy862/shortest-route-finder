import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { findShortestRoute } from "../services/route.service";

function parseRequiredInt(value: unknown, field: string): number {
    if (value === undefined || value === null || value === "") {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Missing required query parameter: ${field}`,
            [{
                field,
                issue: "Missing required parameter"
            }]
        );
    }

    const parsed = Number(value);
    if (isNaN(parsed)) {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Invalid value for parameter: ${field}`,
            [{
                field,
                issue: "Invalid integer"
            }]
        );
    }

    return parsed;
}

export async function getRoute(req: Request, res: Response, next: NextFunction) {
    try {
        const fromId = parseRequiredInt(req.query.from, "from");
        const toId = parseRequiredInt(req.query.to, "to");

        const result = await findShortestRoute(fromId, toId);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}