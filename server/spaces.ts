import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// DigitalOcean Spaces configuration (S3-compatible)
const SPACES_REGION = process.env.DO_SPACES_REGION || "nyc3";
const SPACES_BUCKET = process.env.DO_SPACES_BUCKET || "";
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT || `https://${SPACES_REGION}.digitaloceanspaces.com`;
const SPACES_CDN_ENDPOINT = process.env.DO_SPACES_CDN_ENDPOINT || ""; // e.g. https://bucket.nyc3.cdn.digitaloceanspaces.com

const s3Client = new S3Client({
  endpoint: SPACES_ENDPOINT,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

export function isSpacesConfigured(): boolean {
  return !!(process.env.DO_SPACES_KEY && process.env.DO_SPACES_SECRET && SPACES_BUCKET);
}

/**
 * Generate a presigned URL for uploading a file to DO Spaces.
 * Returns { uploadURL, objectPath, publicUrl }
 */
export async function getPresignedUploadUrl(options: {
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<{ uploadURL: string; objectPath: string; publicUrl: string }> {
  const folder = options.folder || "uploads";
  const ext = options.fileName.split(".").pop() || "";
  const objectKey = `${folder}/${randomUUID()}${ext ? "." + ext : ""}`;

  const command = new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: objectKey,
    ContentType: options.contentType,
    ACL: "public-read",
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  const publicUrl = SPACES_CDN_ENDPOINT
    ? `${SPACES_CDN_ENDPOINT}/${objectKey}`
    : `${SPACES_ENDPOINT}/${SPACES_BUCKET}/${objectKey}`;

  return { uploadURL, objectPath: objectKey, publicUrl };
}

/**
 * Generate a presigned URL for reading a private object.
 */
export async function getPresignedReadUrl(objectKey: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete an object from DO Spaces.
 */
export async function deleteObject(objectKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: objectKey,
  });
  await s3Client.send(command);
}

/**
 * Check if an object exists in DO Spaces.
 */
export async function objectExists(objectKey: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: objectKey,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the public CDN URL for an object.
 */
export function getPublicUrl(objectKey: string): string {
  if (SPACES_CDN_ENDPOINT) {
    return `${SPACES_CDN_ENDPOINT}/${objectKey}`;
  }
  return `${SPACES_ENDPOINT}/${SPACES_BUCKET}/${objectKey}`;
}

export { s3Client, SPACES_BUCKET };
