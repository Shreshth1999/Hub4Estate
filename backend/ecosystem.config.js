/**
 * PM2 Ecosystem Configuration — Hub4Estate Backend
 *
 * Cluster mode: spawns one process per CPU core for horizontal scaling.
 * Run: pm2 start ecosystem.config.js
 * Monitor: pm2 monit
 * Logs: pm2 logs hub4estate-backend
 */
module.exports = {
  apps: [
    {
      name: 'hub4estate-backend',
      script: 'dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for load balancing
      max_memory_restart: '1G', // Restart if memory exceeds 1GB per instance
      node_args: '--max-old-space-size=1024',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Graceful shutdown
      kill_timeout: 5000, // 5s grace period for in-flight requests
      listen_timeout: 10000, // 10s to wait for app to listen
      shutdown_with_message: true,

      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 1000, // 1s between restarts

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/hub4estate/error.log',
      out_file: '/var/log/hub4estate/out.log',
      merge_logs: true,

      // Health check
      exp_backoff_restart_delay: 100, // Exponential backoff on repeated crashes
    },
  ],
};
