module.exports = {
  apps: [{
    name: 'nimbus-cms',
    // Standalone 入口 — cwd 必须设为 standalone 目录，
    // 否则 Next.js 的 public/ 静态文件服务无法正确定位
    script: 'server.js',
    cwd: 'D:\\shimond2\\www\\nimbus-cms\\.next\\standalone',

    // Windows 必须使用 fork 模式，cluster 模式不稳定
    exec_mode: 'fork',
    instances: 1,

    // 从独立文件加载环境变量（避免命令行转义问题）
    env_file: 'D:\\shimond2\\www\\nimbus-cms\\.env.production',

    // 运行时环境变量（覆盖绑定地址和端口）
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      PORT: 3001
    },

    // 日志路径
    log_file: 'D:\\shimond2\\www\\nimbus-cms\\logs\\pm2-combined.log',
    out_file: 'D:\\shimond2\\www\\nimbus-cms\\logs\\pm2-out.log',
    error_file: 'D:\\shimond2\\www\\nimbus-cms\\logs\\pm2-err.log',
    merge_logs: true,
    time: true,

    // 资源限制（防止内存泄漏影响现有系统）
    max_memory_restart: '512M',

    // 重启策略
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    kill_timeout: 5000
  }]
};
