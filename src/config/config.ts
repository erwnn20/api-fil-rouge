import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    hostname: string;
    nodeEnv: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    hostname: process.env.HOSTNAME || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;