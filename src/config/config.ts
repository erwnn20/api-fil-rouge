import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    hostname: string;
}

/**
 * Contains server configuration values
 */
const config: Config = {
    port: Number(process.env.PORT) || 3000,
    hostname: process.env.HOSTNAME || 'localhost',
};

export default config;