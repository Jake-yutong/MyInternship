import { useEffect, useState } from 'react';
import { Application, getCompanyAccentColor } from '../data';

/**
 * Module-level cache: logo data URL string -> extracted hex color (or empty string if extraction failed)
 * Persists across component remounts within the same page session.
 */
const colorCache = new Map<string, string>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return [h / 6, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Extracts the dominant brand color from an image URL using a canvas.
 *
 * Algorithm:
 *   1. Draw the image onto a 64×64 canvas (downscale for performance).
 *   2. For each pixel: skip transparent, near-white, near-black, and near-gray pixels.
 *   3. Compute a chroma-weighted average of the remaining colorful pixels.
 *   4. Convert to HSL and clamp lightness to 30%–52% so white text remains readable.
 *   5. Boost saturation up to at least 50% for vivid brand feel.
 *   6. Return null if no colorful pixels are found (fall back to hash color outside).
 */
function extractDominantColor(imageUrl: string): Promise<string | null> {
  const cached = colorCache.get(imageUrl);
  if (cached !== undefined) {
    return Promise.resolve(cached === '' ? null : cached);
  }

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          colorCache.set(imageUrl, '');
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let totalWeight = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          const brightness = r + g + b;
          // Skip near-white and near-black pixels
          if (brightness > 690 || brightness < 45) continue;

          // Chroma = colorfulness of pixel; skip near-gray pixels
          const chroma = Math.max(r, g, b) - Math.min(r, g, b);
          if (chroma < 20) continue;

          // Weight by chroma so vibrant pixels dominate the average
          rSum += r * chroma;
          gSum += g * chroma;
          bSum += b * chroma;
          totalWeight += chroma;
        }

        if (totalWeight === 0) {
          colorCache.set(imageUrl, '');
          resolve(null);
          return;
        }

        const r = Math.round(rSum / totalWeight);
        const g = Math.round(gSum / totalWeight);
        const b = Math.round(bSum / totalWeight);

        const [h, s, l] = rgbToHsl(r, g, b);

        // If the extracted color is still too gray, fall back
        if (s < 0.12) {
          colorCache.set(imageUrl, '');
          resolve(null);
          return;
        }

        // Clamp lightness for bar readability (white text on colored background)
        const clampedL = Math.min(Math.max(l, 0.30), 0.52);
        // Ensure saturation is high enough for a vivid swatch
        const clampedS = Math.min(Math.max(s, 0.50), 1.0);

        const hex = hslToHex(h, clampedS, clampedL);
        colorCache.set(imageUrl, hex);
        resolve(hex);
      } catch {
        colorCache.set(imageUrl, '');
        resolve(null);
      }
    };

    img.onerror = () => {
      colorCache.set(imageUrl, '');
      resolve(null);
    };

    img.src = imageUrl;
  });
}

/**
 * Returns a Map<applicationId, color> for a list of applications.
 * - If an application has a logo, the color is extracted from the logo image.
 * - Otherwise falls back to the hash-based accent color derived from the company name.
 *
 * The map is populated asynchronously; the initial value uses the hash fallback
 * so bars are always visible even before extraction completes.
 */
export function useLogoColors(applications: Application[]): Map<string, string> {
  const [colorMap, setColorMap] = useState<Map<string, string>>(
    () => new Map(applications.map((app) => [app.id, getCompanyAccentColor(app.companyName)])),
  );

  useEffect(() => {
    let cancelled = false;

    const resolveColors = async () => {
      const entries = await Promise.all(
        applications.map(async (app) => {
          const fallback = getCompanyAccentColor(app.companyName);
          if (!app.logo) {
            return [app.id, fallback] as const;
          }
          const extracted = await extractDominantColor(app.logo);
          return [app.id, extracted ?? fallback] as const;
        }),
      );

      if (!cancelled) {
        setColorMap(new Map(entries));
      }
    };

    void resolveColors();
    return () => {
      cancelled = true;
    };
  }, [applications]);

  return colorMap;
}
