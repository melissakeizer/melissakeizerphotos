"""Trace the approved pencil raster into transparent, layered SVG contours.

Requires Pillow and numpy. No bitmap is embedded in the result. Geometry comes
from interpolated opacity contours, not a geometric reconstruction of the camera.
Future draw-on effects can reveal the named groups with stroke masks.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/camera-blueprint-handdrawn-v4.png'
OUT = ROOT / 'public/camera-pencil-traced.svg'


def simplify(points, tolerance=0.34):
    if len(points) <= 3:
        return points
    p = np.array(points)
    keep = {0, len(p) - 1}
    stack = [(0, len(p) - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        v = p[b] - p[a]
        delta = p[a + 1:b] - p[a]
        if v @ v == 0:
            distances = np.sum(delta * delta, axis=1)
        else:
            t = np.clip(delta @ v / (v @ v), 0, 1)
            distances = np.sum((delta - t[:, None] * v) ** 2, axis=1)
        i = int(np.argmax(distances))
        if distances[i] > tolerance ** 2:
            k = a + 1 + i
            keep.add(k)
            stack.extend([(a, k), (k, b)])
    return p[sorted(keep)].tolist()


def contours(field, level):
    # Marching squares with linear edge interpolation preserves subpixel fades.
    f = np.pad(field, 1)
    tl, tr, br, bl = f[:-1, :-1], f[:-1, 1:], f[1:, 1:], f[1:, :-1]
    cases = (tl >= level).astype('uint8') + 2 * (tr >= level) + 4 * (br >= level) + 8 * (bl >= level)
    ys, xs = np.where((cases > 0) & (cases < 15))
    table = {1: [(3, 0)], 2: [(0, 1)], 3: [(3, 1)], 4: [(1, 2)],
             5: [(3, 0), (1, 2)], 6: [(0, 2)], 7: [(3, 2)], 8: [(2, 3)],
             9: [(0, 2)], 10: [(0, 1), (2, 3)], 11: [(1, 2)],
             12: [(1, 3)], 13: [(0, 1)], 14: [(3, 0)]}
    positions, graph = {}, {}
    for y, x in zip(ys.tolist(), xs.tolist()):
        keys = [(0, y, x), (1, y, x + 1), (0, y + 1, x), (1, y, x)]
        for a, b in table[int(cases[y, x])]:
            for e in (a, b):
                key = keys[e]
                if key in positions:
                    continue
                axis, yy, xx = key
                v0 = f[yy, xx]
                v1 = f[yy, xx + 1] if axis == 0 else f[yy + 1, xx]
                t = float((level - v0) / (v1 - v0)) if v1 != v0 else .5
                positions[key] = (xx - 1 + (t if axis == 0 else 0), yy - 1 + (t if axis == 1 else 0))
            ka, kb = keys[a], keys[b]
            graph.setdefault(ka, []).append(kb)
            graph.setdefault(kb, []).append(ka)
    visited = set()
    result = []
    for start in graph:
        if start in visited:
            continue
        points, previous, current = [], None, start
        while current not in visited:
            visited.add(current)
            points.append(positions[current])
            neighbours = graph[current]
            following = next((n for n in neighbours if n != previous), start)
            previous, current = current, following
        if len(points) < 4:
            continue
        points.append(points[0])
        pts = simplify(points)
        area = abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(pts, pts[1:]))) / 2
        if area < .22:
            continue
        result.append(pts)
    return result


def path_data(points):
    return 'M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in points[:-1]) + 'Z'


def main():
    rgba = np.asarray(Image.open(SOURCE).convert('RGBA'), dtype=float) / 255
    rgb, alpha = rgba[:, :, :3], rgba[:, :, 3]
    # Decompose into neutral graphite plus yellow, retaining the original alpha.
    # Their optical densities add, so the same contours capture soft pencil edges.
    yellow_weight = np.clip((rgb[:, :, 0] - rgb[:, :, 2]) / .64, 0, 1)
    gold = np.clip(alpha * yellow_weight, 0, .96)
    neutral = np.clip(alpha * (1 - yellow_weight) * rgb[:, :, 1] / (37 / 255), 0, .96)
    levels = [.009, .025, .05, .085, .13, .19, .27, .37, .49, .63, .78, .92]
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024" fill="none">',
             '<title>Faded pencil sketch of Melissa’s Sony camera</title>',
             '<desc>Vector contours traced from the approved original camera drawing. Transparent background; original broken graphite lines, construction guides and yellow accents.</desc>']
    counts = {}
    for name, field, color in [('graphite', neutral, '#262523'), ('yellow-accents', gold, '#dcab22')]:
        parts.append(f'<g id="{name}" fill="{color}" fill-rule="evenodd">')
        previous = 0
        counts[name] = 0
        for i, level in enumerate(levels):
            curves = contours(field, level)
            if not curves:
                continue
            target = (level + (levels[i + 1] if i + 1 < len(levels) else .98)) / 2
            opacity = (target - previous) / (1 - previous)
            previous = target
            counts[name] += len(curves)
            parts.append(f'<path id="{name}-tone-{i + 1:02}" opacity="{opacity:.4f}" d="' + ''.join(path_data(c) for c in curves) + '"/>')
        parts.append('</g>')
    parts.append('</svg>')
    OUT.write_text('\n'.join(parts) + '\n')
    print(json.dumps({'output': str(OUT), 'bytes': OUT.stat().st_size, 'contours': counts}))


if __name__ == '__main__':
    main()
