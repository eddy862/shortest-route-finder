export type ErrorCode =
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"
    | "UNPROCESSABLE_STATE"

export class HttpError extends Error {
    status: number;
    code: ErrorCode;
    details?: Array<{ field: string; issue: string }>;

    constructor(status: number, code: ErrorCode, message: string, details?: Array<{ field: string; issue: string }>) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}