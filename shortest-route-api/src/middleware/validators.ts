import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export function requireIntQuery(field: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const raw = req.query[field];
        if (raw === undefined || raw === null || raw === "") {
            return next(
                new HttpError(400, "VALIDATION_ERROR", `'${field}' is required`, [
                    { field, issue: "required" },
                ])
            );
        }

        const num = Number(raw);
        if (!Number.isInteger(num)) {
            return next(
                new HttpError(400, "VALIDATION_ERROR", `'${field}' must be an integer`, [
                    { field, issue: "invalid_integer" },
                ])
            );
        }

        (req as any).validated ??= {};
        (req as any).validated[field] = num;
        next();
    };
}

export function requireIntParam(field: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const num = Number(req.params[field]);
        if (!Number.isInteger(num)) {
            return next(new HttpError(400, "VALIDATION_ERROR", `'${field}' must be an integer`, [
                { field, issue: "invalid_integer" },
            ]));
        }
        (req as any).validated ??= {};
        (req as any).validated[field] = num;
        next();
    };
}

export function requireBodyString(field: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const val = req.body?.[field];
        if (val === undefined || val === null || val === "") {
            return next(new HttpError(400, "VALIDATION_ERROR", `'${field}' is required`, [
                { field, issue: "required" },
            ]));
        }

        if (typeof val !== "string" || val.trim() === "") {
            return next(new HttpError(400, "VALIDATION_ERROR", `'${field}' must be a non-empty string`, [
                { field, issue: "invalid_string" },
            ]));
        }
        (req as any).validated ??= {};
        (req as any).validated[field] = val.trim();
        next();
    };
}

export function requireBodyInt(field: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const val = req.body?.[field];
        if (val === undefined || val === null || val === "") {
            return next(new HttpError(400, "VALIDATION_ERROR", `'${field}' is required`, [
                { field, issue: "required" },
            ]));
        }

        const num = Number(val);
        if (!Number.isInteger(num)) {
            return next(new HttpError(400, "VALIDATION_ERROR", `'${field}' must be an integer`, [
                { field, issue: "invalid_integer" },
            ]));
        }
        (req as any).validated ??= {};
        (req as any).validated[field] = num;
        next();
    }
}