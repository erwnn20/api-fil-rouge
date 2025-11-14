const {createDefaultPreset} = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
    setupFiles: ["dotenv/config"],
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/jest.setup.ts"]
};