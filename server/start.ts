// server/start.ts - Entry point with telemetry support
import '../telemetry.js';  // Initialize OpenTelemetry first
import('./index.ts').catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
