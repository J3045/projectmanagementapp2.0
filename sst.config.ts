// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "projectmanagementapp-main",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs( "site", {
      path: ".", // Path of your Next.js app
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
        DATABASE_URL: process.env.DATABASE_URL || "",
        AUTH_SECRET: process.env.AUTH_SECRET || "",
        AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || "",
        AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || "",
        DIRECT_URL: process.env.DIRECT_URL || "",
      }
    });
  },
});