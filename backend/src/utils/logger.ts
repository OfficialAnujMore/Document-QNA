const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string, data?: unknown) => {
    console.log(`[${timestamp()}] INFO: ${msg}`, data !== undefined ? data : "");
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[${timestamp()}] ERROR: ${msg}`, err !== undefined ? err : "");
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[${timestamp()}] WARN: ${msg}`, data !== undefined ? data : "");
  },
  debug: (msg: string, data?: unknown) => {
    if (process.env.DEBUG === "true") {
      console.log(`[${timestamp()}] DEBUG: ${msg}`, data !== undefined ? data : "");
    }
  },
};
