import importedNotes from '../data/photo-stream-imports.json';
import photoStreamPlan from '../data/photo-stream-plan.json';

export interface FieldNote {
  image: string;
  title: string;
  place?: string;
  date: string;
  camera?: string;
  lens?: string;
  lensModel?: string;
  settings?: string;
  caption?: string;
  memorialDates?: string;
  metadataNote?: string;
  sourceUploadId?: string;
  originalName?: string;
  titleProvisional?: boolean;
  dateToConfirm?: boolean;
  captureDate?: string;
}

// Keep dates and camera details with each image; the PhotoStream chooses its
// visual order separately and does not display dates.
export const fieldNotes: FieldNote[] = [
  ...importedNotes,
  {
    image: 'orca-harper-ned.jpg',
    title: 'Good Genes',
    place: 'Cairn Wood, County Down',
    date: '7 August 2026',
    caption: 'Orca bumped into her full brother, Harper, and nephew, Ned at Cairn Wood. We couldn’t resist a family portrait.',
    camera: 'iPhone 17 Pro',
    lens: '24mm',
    settings: '1/220 · f/1.78 · ISO 200',
  },
  {
    image: 'auditt.jpg',
    title: 'Saying Goodbye to My Audi\u00a0TT',
    caption: 'I bought my dream car in 2020, a Daytona Grey Audi TT Black Edition. This year I swapped it for something more family-friendly, but I still miss this wonderful little motor.',
    place: 'Castle Park, Bangor',
    date: '30 August 2026',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/400 · f/2.5 · ISO 100',
  },
  {
    image: 'riley-orca-cairn-wood.jpg',
    title: 'Orca and Riley.',
    caption: 'My sister’s lovely, laid-back Riley — and probably Orca’s best doggy friend.',
    place: 'Cairn Wood, County Down',
    date: '7 August 2026',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/230 · f/1.8 · ISO 80',
  },
  {
    image: 'chief-puppy.jpg',
    title: 'All Ears',
    caption: 'Meeting Chief, the German Shepherd x Malinois puppy.',
    place: 'Bangor, Northern Ireland',
    date: '13 July 2026',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/120 · f/1.8 · ISO 80',
  },
  {
    image: 'sparrowhawk.jpg',
    title: 'Unusual Garden Visitor',
    caption: 'I grabbed my camera as soon as Elias spotted the sparrowhawk from our bedroom window.',
    place: 'Bangor, Northern Ireland',
    date: '10 July 2026',
    camera: 'Sony A7 IV',
    lens: '200mm',
    settings: '1/320 · f/4 · ISO 500',
  },
  {
    image: '9F5109BE-7078-4927-A5E2-824FA1C847BB.jpg',
    title: 'A muddy dog, very pleased with their work.',
    place: 'Cairn Wood, County Down',
    date: '10 January 2026',
  },
  {
    image: 'orca-cairn-wood-portrait.jpg',
    title: 'Orca at Cairn Wood',
    place: 'Cairn Wood, County Down',
    date: '10 January 2026',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/220 · f/1.8 · ISO 64',
  },
  {
    image: 'pale-waves-belfast.jpg',
    title: 'She’s My Religion',
    caption: 'Heather Baron-Gracie of Pale Waves, performing at The Limelight, Belfast.',
    place: 'The Limelight, Belfast',
    date: '29 October 2025',
    camera: 'iPhone 17 Pro',
    lens: '6.8mm',
    settings: '1/60 · f/1.8 · ISO 200',
  },
  {
    image: 'wes-anderson-swans.jpeg',
    title: 'Wes Anderson, but with Swans',
    place: 'Lazise, Lake Garda, Italy',
    date: '12 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/1500 · f/1.6 · ISO 50',
  },
  {
    image: 'dusk-at-lazise.jpg',
    title: 'Dusk at Lazise',
    caption: 'An evening stroll by Lake Garda, gelato in hand and barely a ripple on the water.',
    place: 'Lazise, Lake Garda, Italy',
    date: '11 June 2025',
    camera: 'iPhone 15',
    lens: '6mm',
    settings: '1/2500 · f/1.6 · ISO 50',
  },
  {
    image: 'castle-espie-5-2.jpg',
    title: 'Excellent Duck. No Notes.',
    caption: 'A Puna teal at Castle Espie Wetland Centre.',
    place: 'Castle Espie, County Down',
    date: '9 March 2025',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/320 · f/3.2 · ISO 100',
  },
  {
    image: 'elias-with-daddy.jpg',
    title: 'A First Trip to the Farm',
    place: 'The Ark Open Farm, County Down',
    caption: 'Elias’s first farm visit, aged one. A chilly morning full of animals to meet — with Pickles, the baby guinea pig, a firm favourite.',
    date: '25 January 2025',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/250 · f/2.5 · ISO 400',
  },
  {
    image: 'orca-and-indie-05.jpg',
    title: 'Orca and Indie',
    place: 'Stormont, Belfast',
    caption: 'A visit from Scotland meant a muddy reunion for Orca and her littermate, Indie. The sisters got on brilliantly, and soon became hard to tell apart.',
    date: '22 December 2023',
    camera: 'Sony A7 IV',
    lens: '200mm',
    settings: '1/1000 · f/5 · ISO 2000',
  },
  {
    image: 'barcelona-parakeet.jpeg',
    title: 'New Friend',
    caption: 'Mikey made a few friends. With a handful of seeds, neither of us stayed parakeet-free for long.',
    place: 'Barcelona, Spain',
    date: '13 October 2023',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/800 · f/3.2 · ISO 160',
  },
  {
    image: 'red-panda-dublin-zoo.jpeg',
    title: 'Red Panda Appreciation Society',
    caption: 'A curious little climber, and finally a red panda photo I was really happy with.',
    place: 'Dublin Zoo',
    date: '25 May 2022',
    camera: 'Sony A7 II',
    lens: '200mm',
    settings: '1/500 · f/4 · ISO 160',
  },
  {
    image: 'strangford-from-ferry.jpeg',
    title: 'Strangford Lough from the Ferry',
    caption: 'Good food, a wander through Strangford, then the ferry across the lough to Portaferry for the drive home. A lovely little day out in County Down.',
    place: 'Strangford Lough, County Down',
    date: '10 July 2020',
    camera: 'Sony A7 II',
    lens: '28mm',
    settings: '1/200 · f/10 · ISO 250',
  },
  {
    image: 'matisse-refinds-1-4.jpg',
    title: 'Remembering Matisse',
    memorialDates: '13.07.07 – 13.04.23',
    caption: 'An emotional goodbye to my heart dog. Such a good boy.',
    date: '25 October 2015',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/125 · f/2.5 · ISO 160',
  },
  {
    image: 'stag-gosford-edit-3.jpg',
    title: 'Bambi, Is That You?',
    caption: 'I’ve always had a soft spot for deer. Lovely to photograph this gorgeous red stag on a summer visit.',
    place: 'Gosford Forest Park',
    date: 'Date to confirm',
    camera: 'Sony A7 IV',
    lens: '200mm',
    settings: '1/800 · f/4',
  },
  {
    image: 'llama-walk.JPG',
    title: 'Llama trekking',
    place: 'The Jungle NI, Moneymore',
    caption: 'A birthday present from Mikey: a countryside stroll with a llama each. Excellent company, all round.',
    date: 'Date to confirm',
    metadataNote: 'Camera details to confirm',
  },
  {
    image: '05-orca-11-months-stacked-p1-2.jpg',
    title: 'Growing Up Beautifully',
    caption: 'Orca at eleven months, looking less like a puppy by the day. Just look at that coat.',
    date: '31 December 2021',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/250 · f/3.2 · ISO 250',
  },
  {
    image: 'DSC05520.jpg',
    title: 'Cascada Monumental',
    place: 'Parc de la Ciutadella, Barcelona',
    caption: 'Swapping the usual wide-angle view for my 55mm prime. A little challenge to find a different frame.',
    date: '10 October 2023',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/320 · f/8 · ISO 100',
  },
  {
    image: 'Orca-four-months--15.jpg',
    title: 'Oh, Orca',
    caption: 'Four months old, all paws and that goofy little face. A very good reason to keep the camera close at home.',
    date: '10 June 2021',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/200 · f/2.8 · ISO 500',
  },
  {
    image: 'bailey-and-sully-22.jpg',
    title: 'Baby Bailey',
    caption: 'When a friend gets a golden retriever puppy, a visit with the camera is compulsory. Puppy kisses are just part of the deal.',
    date: '13 January 2022',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/500 · f/3.5 · ISO 800',
  },
  {
    image: 'barcelona-2023-6.jpg',
    title: 'Got any more?',
    caption: 'Excuse me, any more seeds? A very vocal member of Barcelona’s welcoming committee.',
    place: 'Barcelona, Spain',
    date: '13 October 2023',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/800 · f/3.2 · ISO 160',
  },
  {
    image: 'exploris-shots--15.jpg',
    title: 'A Seal at Exploris',
    place: 'Exploris Aquarium, Portaferry',
    caption: 'A little temporary resident at Exploris, where rescued seals are cared for before returning to the wild.',
    date: '8 January 2022',
    camera: 'Sony A7 II',
    lens: '108mm',
    settings: '1/500 · f/4 · ISO 800',
  },
  {
    image: 'matisse-castle-park-final.jpg',
    title: 'Matisse in the Bluebells',
    caption: 'I took my lovely old boy, Matisse, to Castle Park for a portrait among the blooming bluebells. Hasn’t he got the sweetest little face?',
    place: 'Castle Park, Bangor',
    date: '9 May 2021',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/800 · f/2.8 · ISO 500',
  },
  {
    image: 'orca-castle-park.jpg',
    title: 'Outlandish Orca',
    caption: 'A few leaps over a log, one very enthusiastic Orca, and the shot I’d pictured. All her Aussie energy in one frame — now hanging in my kitchen.',
    place: 'Castle Park, Bangor',
    date: '11 October 2022',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/1000 · f/2.8 · ISO 2500',
  },
  {
    image: 'peregrine-1.jpg',
    title: 'Peregrine Falcon',
    place: 'Hawk Walks NI, Ballyclare',
    caption: 'This little Peregrine Falcon was a highlight of a photography day with my friend Sam. We also had a hawk fly between our heads, which was quite the thrill.',
    date: '14 August 2021',
    camera: 'Sony A7 II',
    lens: '200mm',
    settings: '1/640 · f/5 · ISO 250',
  },
  {
    image: 'porto-edits-1-2.jpg',
    title: 'Livraria Lello',
    caption: 'The most beautiful bookshop I’ve ever been in. Open since 1906, with a staircase that deserves a story of its own.',
    place: 'Porto, Portugal',
    date: '27 August 2022',
    camera: 'Sony A7 II',
    lens: '28mm',
    settings: '1/13 · f/8 · ISO 1000',
  },
  {
    image: 'porto-edits-3.jpg',
    title: 'Porto Waterfront',
    caption: 'Sipping port with Mikey and taking pictures as we cruised along the Douro on our honeymoon. A lovely way to see the city.',
    place: 'Porto, Portugal',
    date: '27 August 2022',
    camera: 'Sony A7 II',
    lens: '55mm',
    settings: '1/640 · f/3.2 · ISO 80',
  },
  {
    image: 'streamvale-farm-8.jpg',
    title: 'New Arrivals',
    place: 'Streamvale Open Farm, Belfast',
    caption: 'A springtime visit to meet the newest arrivals. Welcome to the world, little lambs.',
    date: '26 March 2023',
    camera: 'Sony A7 IV',
    lens: '55mm',
    settings: '1/200 · f/2.8 · ISO 800',
  },
];

// Curated PhotoStream order from the local arranger. Hidden photos remain in
// fieldNotes so they can be restored later without losing their details.
const photoStreamOrder = photoStreamPlan.pages.flatMap(page =>
  page.rows.flatMap(row => 'photos' in row ? row.photos : []));

const notesByImage = new Map(fieldNotes.map(note => [note.image, note]));
export const photoStreamNotes = photoStreamOrder.map(image => {
  const note = notesByImage.get(image);
  if (!note) throw new Error(`PhotoStream order references a missing entry: ${image}`);
  return note;
});
