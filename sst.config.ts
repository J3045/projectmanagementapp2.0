import * as sst from "@serverless-stack/resources";

export default function main(app: sst.App) {
  // Add default function props or other global settings
  app.setDefaultFunctionProps({
    runtime: "nodejs18.x", // Use Node.js 18 runtime
  });

  // Add your stack here
  app.stack(MyStack);
}

// Create the stack for the Next.js site
function MyStack({ stack }: sst.StackContext) {
  // Create the Next.js site
  const site = new sst.NextjsSite(stack, "site", {
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
