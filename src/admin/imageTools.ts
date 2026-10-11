/** Shrinks a picture in the browser so it fits comfortably inside a database document. */
export async function fileToDataUrl(file: File, maxWidth = 1400, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let url = canvas.toDataURL('image/webp', quality);
  if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', quality);
  return url;
}

/** Roughly how many bytes a stored string takes in the database. */
export const approxBytes = (value: string) => Math.round(value.length * 0.75);

/** A Firestore document may hold about 1 MB, so leave room for the other fields. */
export const MAX_IMAGE_BYTES = 850_000;

export const formatBytes = (bytes: number) =>
  bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
