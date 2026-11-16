const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./ui-tests",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5193",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "npm run dev --prefix client -- --host 127.0.0.1 --port 5193 --strictPort",
    url: "http://127.0.0.1:5193",
    reuseExistingServer: false,
  },
});
