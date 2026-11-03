import { webPhoto } from '../../scripts/web-media.mjs';

export async function responsivePhoto(src: string) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const relative = src.startsWith(base) ? src.slice(base.length) : src.replace(/^\//, '');
  const photo = await webPhoto(relative);
  const choices = photo.variants.map((variant: { path: string; width: number }) => ({ url: `${base}${variant.path}`, width: variant.width }));
  return {
    src: choices[0].url,
    srcset: choices.map((variant: { url: string; width: number }) => `${variant.url} ${variant.width}w`).join(', '),
    width: photo.width, height: photo.height,
  };
}
