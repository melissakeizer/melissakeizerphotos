// Only read the camera tags we display. Never expose GPS, serial numbers or
// other private EXIF fields in planner records or public page data.
export function cameraDetails(exif) {
  try {
    if (!Buffer.isBuffer(exif)) return {};
    const base = exif.subarray(0, 6).equals(Buffer.from('Exif\0\0')) ? 6 : 0;
    const order = exif.toString('ascii', base, base + 2);
    if (!['II', 'MM'].includes(order)) return {};
    const little = order === 'II';
    const u16 = p => little ? exif.readUInt16LE(p) : exif.readUInt16BE(p);
    const u32 = p => little ? exif.readUInt32LE(p) : exif.readUInt32BE(p);
    if (u16(base + 2) !== 42) return {};
    const directory = relative => {
      const p = base + relative, tags = new Map();
      const count = Math.min(u16(p), 512);
      for (let i = 0; i < count; i++) {
        const entry = p + 2 + i * 12;
        if (entry + 12 > exif.length) break;
        const tag = u16(entry), type = u16(entry + 2), count = u32(entry + 4);
        if (![0x010f, 0x0110, 0x8769, 0x829a, 0x829d, 0x8827, 0x920a, 0xa434].includes(tag)) continue;
        const bytes = ({ 2: 1, 3: 2, 4: 4, 5: 8 })[type];
        if (!bytes || count < 1 || count > 512) continue;
        const start = count * bytes <= 4 ? entry + 8 : base + u32(entry + 8);
        if (start < base || start + count * bytes > exif.length) continue;
        let value;
        if (type === 2) value = exif.toString('utf8', start, start + count).replace(/\0.*$/s, '').replace(/[\x00-\x1f\x7f]/g, '').trim();
        else if (type === 3) value = u16(start);
        else if (type === 4) value = u32(start);
        else if (u32(start + 4)) value = u32(start) / u32(start + 4);
        if (value !== undefined) tags.set(tag, value);
      }
      return tags;
    };
    const root = directory(u32(base + 4));
    const detail = Number.isInteger(root.get(0x8769)) ? directory(root.get(0x8769)) : new Map();
    const make = root.get(0x010f), model = root.get(0x0110);
    const camera = typeof model === 'string' && model ? ({ 'ILCE-7M2': 'Sony A7 II', 'ILCE-7M4': 'Sony A7 IV' })[model]
      || (make === 'Apple' || !make || model.toLowerCase().startsWith(String(make).toLowerCase()) ? model : `${make === 'SONY' ? 'Sony' : make} ${model}`) : undefined;
    const number = (tag, maximum) => {
      const value = detail.get(tag);
      return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= maximum ? value : undefined;
    };
    const focal = number(0x920a, 10000), seconds = number(0x829a, 86400), aperture = number(0x829d, 128), iso = number(0x8827, 10000000);
    const rounded = (value, places = 1) => Number(value.toFixed(places));
    const settings = [seconds && (seconds <= .25 ? `1/${rounded(1 / seconds, 2)}` : `${rounded(seconds, 3)}s`), aperture && `f/${rounded(aperture)}`, iso && `ISO ${Math.round(iso)}`].filter(Boolean).join(' · ');
    const lensModel = detail.get(0xa434);
    return { ...(camera ? { camera } : {}), ...(focal ? { lens: `${rounded(focal)}mm` } : {}), ...(typeof lensModel === 'string' && lensModel ? { lensModel } : {}), ...(settings ? { settings } : {}) };
  } catch { return {}; } // Missing/malformed EXIF never invalidates a photograph.
}
