import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "routine-farm",
  brand: {
    displayName: "루티팜",
    primaryColor: "#E8722A",
    icon: "https://static.toss.im/appsintoss/32883/bd7c6702-c143-47cb-a8f9-9518756084f5.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
