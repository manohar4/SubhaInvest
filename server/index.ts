import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { AddressInfo } from 'net';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const startServer = async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        server.listen(PORT, HOST, () => {
          resolve();
        }).on('error', (err: Error) => {
          reject(err);
        });
      });
      
      log(`Server is running on http://${HOST}:${PORT}`);
      
      // Handle graceful shutdown
      const shutdown = () => {
        log('Shutdown signal received: closing HTTP server');
        server.close(() => {
          log('HTTP server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') {
        log(`Port ${PORT} is already in use. Trying alternative port...`);
        // Try alternative port
        await new Promise<void>((resolve, reject) => {
          server.listen(0, HOST, () => {
            const address = server.address();
            if (address && typeof address !== 'string') {
              log(`Server is running on http://${HOST}:${address.port}`);
            }
            resolve();
          }).on('error', (err: Error) => {
            reject(err);
          });
        });
      } else {
        log(`Error starting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    }
  };

  startServer();
})();
