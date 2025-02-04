import * as sst from "@serverless-stack/resources"; // For SST v1

export default function main(app: sst.App) {
  // Add default function props or other global settings
  app.setDefaultFunctionProps({
    runtime: "nodejs18.x",
  });

  // Add your stack here
  app.stack(MyStack);
}

// Create the stack for the Next.js site
class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string) {
    super(scope, id);

    // Create the Next.js site
    const site = new sst.NextjsSite(this, "site", {
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
    this.addOutputs({
      SiteUrl: site.url,
    });
  }
}
