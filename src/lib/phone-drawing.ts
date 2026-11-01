import type { PencilStroke } from './camera-drawing';

// Pen movements follow the approved raster's contours; they reveal its texture,
// rather than replacing it with clean geometric strokes.
export const phoneStrokes: PencilStroke[] = [];
const pen = (phase: string, d: string, start: number, duration: number, width = 22) =>
  phoneStrokes.push({ phase, d, start, duration, width });

pen('Outer silhouette', 'M183 1110L184 447Q184 281 348 282H880Q1035 285 1035 445L1040 1130', 0, 2.6, 30);
pen('Inner silhouette', 'M211 1170L210 444Q212 310 350 310H875Q1010 309 1011 445L1011 1180', 1.5, 2.1, 22);
pen('Camera island', 'M349 335H873Q991 336 991 448L989 651Q986 756 878 757H346Q232 755 232 649V447Q231 338 349 335', 2.7, 2.1, 25);
pen('Camera island pencil echo', 'M251 679Q263 779 359 775H885Q1006 772 1005 651', 4.2, .9, 19);
pen('Back panel', 'M246 1139V911Q245 811 347 811H884Q991 811 993 910V1140', 4.8, 1.25, 26);

function ring(cx: number, cy: number, r: number, start: number, duration: number, width = 18) {
  pen('Lens pencil rings', `M${cx} ${cy-r}A${r} ${r} 0 1 1 ${cx-.1} ${cy-r}`, start, duration, width);
}
// Each lens is drawn separately, from its broken outer rim to its pupil.
[[357,452,6], [552,553,8.15], [354,652,10.3]].forEach(([x,y,start]) => {
  ring(x,y,98,start,.72,22);
  ring(x,y,83,start+.55,.62,20);
  ring(x,y,65,start+1.03,.48,21);
  ring(x,y,22,start+1.42,.4,18);
  ring(x,y,7,start+1.7,.26,10);
});
ring(896,445,42,12.4,.55,20);
ring(896,445,25,12.85,.35,23);
ring(897,665,39,13.15,.5,23);
ring(897,665,20,13.5,.35,25);
ring(896,551,10,13.8,.2,12);
pen('Side buttons', 'M182 787L173 790V907L182 910M1040 480L1055 482V680L1040 686M1040 735L1057 737V856L1040 861', 13.6, .7, 15);
pen('Construction overshoots', 'M151 454H511M345 247V381M267 266V375M815 445H961M896 254V786M999 279V373M986 871H1080M186 1089H222', 14, .75, 13);
export const phoneAccents: PencilStroke[] = [
  {phase:'Yellow pencil accent',d:'M272 412Q292 351 356 347Q421 347 451 403',start:14.65,duration:.65,width:24},
];

export const fullPhoneStrokes: PencilStroke[] = [
  ...phoneStrokes.map(stroke => ({ ...stroke, start: stroke.start * .86, duration: stroke.duration * .86 })),
  { phase: 'Full phone contour', d: 'M184 890V1925Q184 2070 329 2070H890Q1035 2070 1035 1925V890', start: 1.4, duration: 2.4, width: 23 },
  { phase: 'Inner body pencil contour', d: 'M210 900V1920Q210 2048 338 2048H881Q1009 2048 1009 1920V900', start: 3.5, duration: 1.8, width: 20 },
  { phase: 'Back panel contour', d: 'M242 905V1910Q242 2020 352 2020H867Q977 2020 977 1910V905', start: 5.1, duration: 1.7, width: 22 },
  { phase: 'Apple outline', d: 'M610 1345C560 1319 533 1367 548 1417C571 1481 586 1468 611 1461C648 1485 663 1459 678 1428C646 1418 646 1383 678 1369C652 1327 635 1339 610 1345M610 1330C604 1301 634 1285 646 1287C647 1311 630 1330 610 1330', start: 12.9, duration: 1.3, width: 18 },
  { phase: 'Lower antenna marks', d: 'M173 1840H245M982 1840H1048', start: 14.15, duration: .3, width: 16 },
];
