/**
 * Storage layer: fetch image from URL and save to public/cdn path.
 * Saves under public/cdn/posts/ for static serving. Optional WebP conversion can be added later.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DEFAULT_PUBLIC_DIR = 'public';
const POSTS_IMAGE_SUBDIR = 'cdn/posts';

export interface StoreImageOptions {
  /** Project root (where public/ lives). Defaults to process.cwd() */
  publicDir?: string;
  /** Subdirectory under public, e.g. 'cdn/posts'. Default POSTS_IMAGE_SUBDIR */
  subDir?: string;
}

/**
 * Fetch image from URL and store to public/cdn/posts/{filename}.
 * Returns the public URL path (e.g. /cdn/posts/slug.jpg) for use in posts.
 * EXIF stripping / WebP conversion can be added here later.
 */
export async function storeImage(
  imageUrl: string,
  filename: string,
  options: StoreImageOptions = {}
): Promise<string> {
  const publicDir = options.publicDir ?? process.cwd();
  const subDir = options.subDir ?? POSTS_IMAGE_SUBDIR;
  const dirPath = join(publicDir, DEFAULT_PUBLIC_DIR, subDir);
  const filePath = join(dirPath, filename);

  await mkdir(dirPath, { recursive: true });

  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();

  await writeFile(filePath, Buffer.from(buffer));

  // Return path as used in HTML (leading slash, no "public")
  return `/${subDir}/${filename}`;
}
