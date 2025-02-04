import { App, StackContext, NextjsSite } from "@serverless-stack/resources"; // For SST v2

export default function main(app: App) {
  // Set the region to ap-south-1
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x", // Now supported in SST v2
    environment: {
      AWS_REGION: "ap-south-1",
    },
  });

  // Add your stack here
  app.stack(MyStack);
}

// Create the stack for the Next.js site
function MyStack({ stack }: StackContext) {
  // Create the Next.js site
  const site = new NextjsSite(stack, "site", {
    path: ".", // Point to the current directory where your Next.js app resides
    environment: {
      DATABASE_URL: process.env.DATABASE_URL!,
      DIRECT_URL: process.env.DIRECT_URL!,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
      AUTH_SECRET: process.env.AUTH_SECRET!,
      AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID!,
      AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET!,
    },
  });

  // Add output for the site URL
  stack.addOutputs({
    SiteUrl: site.url,
  });
}