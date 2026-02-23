import path from "node:path"
import { defineConfig } from "prisma/config"

// Load .env.local since Prisma CLI only reads .env by default
import("dotenv").then((dotenv) =>
    dotenv.config({ path: path.join(__dirname, ".env.local") })
)

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
