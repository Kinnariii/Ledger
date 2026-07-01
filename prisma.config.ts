/**
 * Prisma v7 Configuration
 * =======================
 * Prisma v7 moved connection URL configuration from schema.prisma
 * to this config file. The DATABASE_URL is read from environment
 * variables and passed to both the migrate and client configs.
 *
 * See: https://pris.ly/d/config-datasource
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
