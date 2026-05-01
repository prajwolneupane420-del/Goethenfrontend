import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import app from './app';
import { connectDB } from './config/db';
import { seedProducts } from './utils/seeder';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    if (process.env.NODE_ENV !== "production") {
      seedProducts();
    }

    if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

export { startServer };
startServer();
