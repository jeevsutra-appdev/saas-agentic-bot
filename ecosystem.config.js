module.exports = {
  apps: [
    {
      name: "aether-web",
      script: "apps/web/server.js", // Standalone outputs a custom server.js
      instances: "max", // Scale across all available CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
