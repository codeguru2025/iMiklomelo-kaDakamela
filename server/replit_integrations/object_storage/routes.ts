import type { Express } from "express";
import { getPresignedUploadUrl, isSpacesConfigured, getPublicUrl } from "../../spaces";

/**
 * Register object storage routes for file uploads via DigitalOcean Spaces.
 *
 * Upload flow:
 * 1. POST /api/uploads/request-url - Get a presigned URL for uploading
 * 2. Client uploads directly to the presigned URL (PUT)
 * 3. The objectPath / publicUrl is stored in the database
 */
export function registerObjectStorageRoutes(app: Express): void {
  /**
   * Request a presigned URL for file upload.
   *
   * Request body (JSON):
   * {
   *   "name": "filename.jpg",
   *   "size": 12345,
   *   "contentType": "image/jpeg"
   * }
   *
   * Response:
   * {
   *   "uploadURL": "https://bucket.nyc3.digitaloceanspaces.com/...",
   *   "objectPath": "uploads/uuid.jpg",
   *   "publicUrl": "https://bucket.nyc3.cdn.digitaloceanspaces.com/uploads/uuid.jpg"
   * }
   */
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      if (!isSpacesConfigured()) {
        return res.status(503).json({
          error: "Object storage not configured. Set DO_SPACES_KEY, DO_SPACES_SECRET, and DO_SPACES_BUCKET.",
        });
      }

      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const { uploadURL, objectPath, publicUrl } = await getPresignedUploadUrl({
        fileName: name,
        contentType: contentType || "application/octet-stream",
      });

      res.json({
        uploadURL,
        objectPath,
        publicUrl,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Redirect /objects/* paths to the Spaces CDN URL.
   * This keeps backward compatibility with any stored /objects/... paths.
   */
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

