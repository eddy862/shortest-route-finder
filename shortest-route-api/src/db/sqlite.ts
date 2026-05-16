import path from "path";
import sqlite3 from "sqlite3"
import { env } from "../config/env";

const dbPath = path.resolve(process.cwd(), env.DB_PATH);
export const db = new sqlite3.Database(dbPath);

// this function is used to run SQL queries that return multiple rows
export function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows as T[]);
            }
        });
    });
}

// this function is used to run SQL queries that return a single row
export function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row as T || undefined);
            }
        });
    });
}

// this function is used to run SQL queries that modify the database (INSERT, UPDATE, DELETE)
// returns an object containing the last inserted ID and the number of rows affected
export function run(
    sql: string,
    params: unknown[] = []
): Promise<{ lastID: number, changes: number }> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}