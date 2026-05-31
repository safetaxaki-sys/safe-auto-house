import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.safeautohouse.portal",
  appName: "Safe Auto-House",
  webDir: "out",
  server: {
    // Replace this with the final production URL after Vercel/domain setup.
    url: "https://app.safeautohouse.com",
    cleartext: false,
  },
  android: {
    buildOptions: {
      releaseType: "AAB",
    },
  },
};

export default config;
