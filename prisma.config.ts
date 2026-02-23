/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv")
const path = require("node:path")

dotenv.config({ path: path.join(__dirname, ".env.local") })
dotenv.config({ path: path.join(__dirname, ".env") })

import { defineConfig } from "prisma/config"

export default defineConfig({
    earlyAccess: true,
    schema: path.join(__dirname, "prisma", "schema.prisma"),
    migrations: {
        seed: "npx tsx prisma/seed.ts",
    },
    datasource: {
        url: process.env.DATABASE_URL!,
    },
})
