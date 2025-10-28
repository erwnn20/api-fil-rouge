import swaggerJsdoc from "swagger-jsdoc";
import * as server from "../server"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Dev API - Projet Fil Rouge",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        // id: {type: "integer", example: 1},
                        username: {type: "string", example: "johndoe"},
                        email: {type: "string", example: "john.doe@mail.com"},
                        firstname: {type: "string?", nullable: true, example: "John"},
                        lastname: {type: "string", example: "Doe"},
                        // password: {type: "string", example: },
                        role: {type: "string", enum: ["USER", "ADMIN"], example: "USER"},
                        // created_at: {type: "datetime"},
                    },
                },
                Ban: {
                    type: "object",
                    properties: {
                        startAt: {type: "string", format: "date-time", example: "2025-10-26T12:00:00Z"},
                        endAt: {
                            type: "string", format: "date-time",
                            nullable: true, example: "2025-10-26T13:00:00Z"
                        },
                        reason: {type: "string", example: "Comportement inapproprié"},
                        user: {$ref: "#/components/schemas/User"},
                    },
                },
            },
        },
        security: [{bearerAuth: []}],
    },
    servers: [
        {
            url: server.url,
        },
    ],
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
