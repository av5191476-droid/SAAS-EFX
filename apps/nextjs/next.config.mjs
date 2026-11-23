import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@efx/api", "@efx/db", "@efx/quant", "@efx/stripe", "@efx/ui"],
  serverExternalPackages: ["@prisma/client"],
  eslint: { ignoreDuringBuilds: true },
};

export default config;
