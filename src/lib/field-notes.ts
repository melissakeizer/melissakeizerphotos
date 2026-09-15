export interface FieldNote {
  image: string;
  title: string;
  place?: string;
  date: string;
  camera?: string;
  lens?: string;
  settings?: string;
}

// New notes belong at the top. This small data file keeps captions and camera
// details editable without turning every single photograph into a full post.
export const fieldNotes: FieldNote[] = [
  {
    image: 'C0B05AB8-AA2B-4BFF-89DA-3C0F7DB1CA66.jpg',
    title: 'Three good dogs beneath an old tree.',
    date: '6 September 2026',
  },
  {
    image: 'auditt.jpg',
    title: 'Seen along the way',
    date: '30 August 2026',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/400 · f/2.5 · ISO 100',
  },
  {
    image: 'IMG_2136.jpg',
    title: 'A small encounter',
    date: '7 August 2026',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/230 · f/1.8 · ISO 80',
  },
  {
    image: 'IMG_1318.jpg',
    title: 'Close to home',
    date: '13 July 2026',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/120 · f/1.8 · ISO 80',
  },
  {
    image: 'sparrowhawk.jpg',
    title: 'Sparrowhawk in the garden',
    place: 'Bangor, Northern Ireland',
    date: '10 July 2026',
    camera: 'Sony A7 IV',
    lens: '200mm',
    settings: '1/320 · f/4 · ISO 500',
  },
  {
    image: '9F5109BE-7078-4927-A5E2-824FA1C847BB.jpg',
    title: 'A muddy dog, very pleased with their work.',
    date: '10 January 2026',
  },
  {
    image: 'IMG_2691.jpg',
    title: 'After dark',
    date: '29 October 2025',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/60 · f/1.8 · ISO 200',
  },
  {
    image: 'IMG_8478.jpg',
    title: 'A moment worth keeping',
    date: '14 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/120 · f/1.6 · ISO 40',
  },
  {
    image: '5801B5FD-A1D2-458D-A7A9-C293AA37737E_1_105_c.jpeg',
    title: 'A swan and her cygnets in impossibly blue water.',
    date: '12 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/1500 · f/1.6 · ISO 50',
  },
  {
    image: 'B1730D55-1C8F-4298-A0CC-FE51065F250E_1_105_c.jpeg',
    title: 'The harbour turning blue at dusk.',
    date: '10 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/50 · f/1.6 · ISO 160',
  },
  {
    image: 'CD559E27-A3B6-4847-88F3-23600E312AA5_1_105_c.jpeg',
    title: 'Little boats waiting along the waterfront.',
    date: '9 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/4000 · f/1.6 · ISO 50',
  },
  {
    image: 'castle-espie-5-2.jpg',
    title: 'Castle Espie',
    place: 'County Down, Northern Ireland',
    date: '9 March 2025',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/320 · f/3.2 · ISO 100',
  },
  {
    image: '419ED7E6-DFC6-4CFD-B55B-94D4ABA16A06_1_105_c.jpeg',
    title: 'From the archive',
    date: '25 May 2022',
    camera: 'Sony A7 II',
    lens: '200mm',
    settings: '1/500 · f/4 · ISO 160',
  },
  {
    image: '7E90570A-F874-440A-BB64-F94C7D66A52B_1_102_o.jpeg',
    title: 'From the archive',
    date: '10 July 2020',
    camera: 'Sony A7 II',
    lens: '28mm',
    settings: '1/200 · f/10 · ISO 250',
  },
];
