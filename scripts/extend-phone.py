"""Extend the approved vector phone sketch with broken, layered pencil lines.

The camera cluster remains the traced artwork. The full body proportions follow
the supplied back-view reference. Generated geometry is deterministic.
"""
from pathlib import Path
import re
import random
import math

ROOT = Path(__file__).resolve().parents[1]
rng = random.Random(17)
source = (ROOT / 'public/phone-pencil-traced.svg').read_text()
graphite = re.search(r'<g id="graphite"[^>]*>(.*?)</g>', source, re.S).group(1)
gold = re.search(r'<g id="yellow-accents"[^>]*>(.*?)</g>', source, re.S).group(1)

def curve(points, steps=36):
    """Sample a cubic Bezier; separate pen strokes can share their endpoints."""
    out = []
    for i in range(steps + 1):
        t = i / steps
        weights = [(1-t)**3, 3*(1-t)**2*t, 3*(1-t)*t*t, t**3]
        out.append(tuple(sum(p[axis]*w for p,w in zip(points,weights)) for axis in (0,1)))
    return out

def pencil(points, opacity=.23):
    layers = []
    for layer in range(7):
        offset = rng.uniform(-4,4)
        pts = [(x + offset + rng.uniform(-1.1,1.1), y + offset + rng.uniform(-1.1,1.1)) for x,y in points]
        d = 'M' + 'L'.join(f'{x:.2f},{y:.2f}' for x,y in pts)
        dash = f'{rng.uniform(8,28):.1f} {rng.uniform(1,5):.1f}'
        layers.append(f'<path d="{d}" fill="none" stroke="#716b60" stroke-width="{rng.uniform(.65,1.6):.2f}" stroke-linecap="round" stroke-dasharray="{dash}" opacity="{opacity:.3f}"/>')
    return ''.join(layers)

extensions = []
for x, bottom, radius in [(184,2070,145),(210,2048,128),(242,2020,110)]:
    right = 1219-x
    y0 = 890
    left = [(x,y0+i*(bottom-radius-y0)/65) for i in range(66)]
    left += curve([(x,bottom-radius),(x,bottom-30),(x+30,bottom),(x+radius,bottom)])
    left += [(x+radius+i*(right-x-2*radius)/36,bottom) for i in range(37)]
    left += curve([(right-radius,bottom),(right-30,bottom),(right,bottom-30),(right,bottom-radius)])
    left += [(right,bottom-radius-i*(bottom-radius-y0)/65) for i in range(66)]
    extensions.append(pencil(left))

# A lightly outlined, deliberately incomplete Apple mark; no filled silhouette.
logo = curve([(610,1430),(560,1404),(533,1452),(548,1502)])
logo += curve([(548,1502),(571,1566),(586,1553),(611,1546)])
logo += curve([(611,1546),(648,1570),(663,1544),(678,1513)])
logo += curve([(678,1513),(646,1503),(646,1468),(678,1454)])
logo += curve([(678,1454),(652,1412),(635,1424),(610,1430)])
# Reference logo centre is about 63% down the complete device.
extensions.append(pencil([(x,y-85) for x,y in logo],.34))
extensions.append(pencil([(x,y-85) for x,y in curve([(610,1415),(604,1386),(634,1370),(646,1372)]) + curve([(646,1372),(647,1396),(630,1415),(610,1415)])],.34))
for y in (1840,):
    extensions.append(pencil([(173,y),(212,y),(245,y)],.07))
    extensions.append(pencil([(982,y),(1020,y),(1048,y)],.07))

svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="140 235 950 1900" fill="none">\n'
svg += '<title>Full iPhone pencil sketch</title><desc>Original traced camera cluster with layered, broken pencil contours completing the phone body.</desc>\n'
svg += '<g id="graphite" fill="#716b60" fill-rule="evenodd">' + graphite + ''.join(extensions) + '</g>\n'
svg += '<g id="yellow-accents" fill="#dcab22" fill-rule="evenodd">' + gold + '</g>\n</svg>\n'
out = ROOT / 'public/phone-full-pencil.svg'
out.write_text(svg)
print(f'{out}: {out.stat().st_size:,} bytes')
