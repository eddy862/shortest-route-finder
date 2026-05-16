import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

export const env = {
    PORT: Number(process.env.PORT ?? 3000),
    DB_PATH: process.env.DB_PATH?.trim() ?? 'delivery.db'
}