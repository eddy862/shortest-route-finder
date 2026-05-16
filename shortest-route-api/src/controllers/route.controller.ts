import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { findShortestRoute } from "../services/route.service";

export async function getRoute(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as Partial<{ from: unknown; to: unknown }>;

        if (query.from === undefined || query.to === undefined) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "from and to are required query parameters",
                [
                    {
                        field: "from",
                        issue: query.from === undefined ? "required" : "ok"
                    },
                    {
                        field: "to",
                        issue: query.to === undefined ? "required" : "ok"
                    }
                ]
            );
        }

        const fromId = Number(query.from);
        const toId = Number(query.to);

        if (isNaN(fromId) || isNaN(toId)) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "from and to must be valid integers",
                [
                    {
                        field: "from",
                        issue: isNaN(fromId) ? "invalid integer" : "ok"
                    },
                    {
                        field: "to",
                        issue: isNaN(toId) ? "invalid integer" : "ok"
                    }
                ]
            );
        }

        const result = await findShortestRoute(fromId, toId);
        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}