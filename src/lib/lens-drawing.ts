import type { PencilStroke } from './camera-drawing';
export const lensStrokes: PencilStroke[] = [];
const pen = (phase: string, d: string, start: number, duration: number, width = 30) =>
  lensStrokes.push({ phase, d, start, duration, width });

pen('Barrel outline', 'M150 1017V145H958L1048 170H1200L1248 277H1309V883L1248 978H1048L958 1017Z', 0, 2.6, 40);
pen('Front rim', 'M173 141V1019M253 140V1019', 1.6, 1.3, 32);
pen('Focus ring', 'M539 141Q596 314 579 563Q596 824 540 1017', 2.6, 1.3, 34);
pen('Barrel seam', 'M959 141Q1000 245 991 574Q1004 886 959 1017', 3.3, 1.2, 35);
pen('Rear collar', 'M1048 169Q1084 383 1072 579Q1086 811 1049 981', 4.25, 1, 31);
pen('Rear rim', 'M1196 169Q1252 332 1240 576Q1258 817 1197 985', 4.95, 1, 35);
pen('Mount', 'M1270 278Q1291 554 1271 877M1310 295Q1344 584 1310 886', 5.5, 1.1, 28);
[173,200,286,440,600,825,950,980].forEach((y,i) =>
  pen('Construction strokes', `M100 ${y}H1355`, 6.35+i*.22, .55, 24));
for (let i=0;i<32;i++) {
  const y = 210+i*23;
  pen('Partial focus texture', `M265 ${y}Q337 ${y-4} ${400+(i%5)*9} ${y+2}`, 8.2+i*.08, .28, 17);
}
pen('Alignment dot', 'M1198 564A20 20 0 1 1 1197.9 564M1198 575A9 9 0 1 1 1197.9 575', 10.9, .55, 19);
pen('Mount screw', 'M1270 808A12 12 0 1 1 1269.9 808M1264 814L1278 827M1277 814L1264 827', 11.4, .5, 14);
pen('Badge outline', 'M707 629V508H849V629Q781 600 707 629Z', 11.8, .75, 21);
pen('Zeiss lettering', 'M726 541H748L727 566H748M773 542H754V566H774M756 553H770M789 540V568M783 541H795M783 566H795M818 544Q793 532 800 549L815 556Q824 573 800 565M841 544Q819 533 822 549L837 556Q846 573 824 565', 12.4, 1.15, 11);
pen('Pencil overshoots', 'M101 157H281M165 102V196M255 104V188M936 144L960 109L984 177M1187 130L1214 218M105 1023H278M960 980V1070', 13.65, .9, 20);
export const lensAccents: PencilStroke[] = [
  {phase:'Yellow badge edge',d:'M707 629V508H849V629Q781 600 707 629',start:14.1,duration:.65,width:23},
  {phase:'Yellow pencil hatching',d:'M719 527L731 514M739 532L752 516M763 529L776 515M786 530L800 515M811 531L827 515M719 602L735 582M738 610L765 580M774 608L798 581M805 610L834 580',start:14.7,duration:.6,width:18},
];
