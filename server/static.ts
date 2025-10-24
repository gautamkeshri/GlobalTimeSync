import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
