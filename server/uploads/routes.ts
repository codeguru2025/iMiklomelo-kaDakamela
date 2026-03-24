import type { Express } from "express";
import { getPresignedUploadUrl, isSpacesConfigured, getPublicUrl } from "../spaces";

/**
 * Register upload routes for file uploads via DigitalOcean Spaces.
 *
 * Upload flow:
 * 1. POST /api/uploads/request-url - Get a presigned URL for uploading
 * 2. Client uploads directly to the presigned URL (PUT)
 * 3. The objectPath / publicUrl is stored in the database
 */
export function registerUploadRoutes(app: Express): void {
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      if (!isSpacesConfigured()) {
        console.error("[Upload] Spaces not configured - upload request rejected");
        return res.status(503).json({
          error: "Object storage not configured. Set DO_SPACES_KEY, DO_SPACES_SECRET, and DO_SPACES_BUCKET.",
        });
      }

      const { name, size, contentType } = req.body;

      if (!name) {
        console.error("[Upload] Missing file name in request");
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      console.log(`[Upload] Generating presigned URL for: ${name} (${contentType || 'application/octet-stream'})`);

      const { uploadURL, objectPath, publicUrl } = await getPresignedUploadUrl({
        fileName: name,
        contentType: contentType || "application/octet-stream",
        folder: "attached assets",
      });

      console.log(`[Upload] Generated URL for: ${objectPath}`);

      res.json({
        uploadURL,
        objectPath,
        publicUrl,
        metadata: { name, size, contentType },
      });
    } catch (error: any) {
      console.error("[Upload] Error generating upload URL:", error?.message || error);
      console.error("[Upload] Error details:", error);
      res.status(500).json({ 
        error: "Failed to generate upload URL",
        details: error?.message || "Unknown error"
      });
    }
  });

  // Redirect /objects/* paths to the Spaces CDN URL (backward compat)
  app.get("/objects/:dir/:id", async (req, res) => {
    try {
      const objectKey = `${req.params.dir}/${req.params.id}`;
      const publicUrl = getPublicUrl(objectKey);
      res.redirect(301, publicUrl);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
