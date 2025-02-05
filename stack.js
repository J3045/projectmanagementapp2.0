import { StackContext, NextjsSite } from "sst/constructs";  // Import SST constructs

export default function MyStack({ stack }: StackContext) {
  // Define your Next.js site here
  const site = new NextjsSite(stack, "Site", {
    path: ".", // Path to your Next.js app
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
      DATABASE_URL: process.env.DATABASE_URL || "",
      AUTH_SECRET: process.env.AUTH_SECRET || "",
      AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || "",
      AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || "",
      DIRECT_URL: process.env.DIRECT_URL || "",
    },
  });

  // Outputs for easy access to the site URL
  stack.addOutputs({
    SiteUrl: site.url,
  });
}
