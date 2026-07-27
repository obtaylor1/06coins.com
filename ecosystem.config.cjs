module.exports = {
  apps: [{
    name: "06coins",
    script: "dist/index.js",
    node_args: "--env-file-if-exists=.env",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_memory_restart: "750M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
  }],
};
