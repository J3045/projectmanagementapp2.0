import { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "projectmanagementapp",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL!,
          DIRECT_URL: process.env.DIRECT_URL!,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
          AUTH_SECRET: process.env.AUTH_SECRET!,
          AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID!,
          AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET!,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
