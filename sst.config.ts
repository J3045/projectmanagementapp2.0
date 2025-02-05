import { NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "projectmanagementapp",
      region: "ap-south-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        environment: {
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
          DATABASE_URL: process.env.DATABASE_URL || "",
          AUTH_SECRET: process.env.AUTH_SECRET || "",
          AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || "",
          AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || "",
          DIRECT_URL: process.env.DIRECT_URL || "",
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
};
