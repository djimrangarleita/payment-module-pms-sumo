import monitor from "./database-monitor";

monitor.startMonitoring().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  monitor.stopMonitoring();
  process.exit(0);
});