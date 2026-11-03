export interface PhotoStreamQuestionBlock {
  id: string;
  beforeImage: string;
  label: string;
  layout?: 'two-column' | 'staggered';
  hidden?: boolean;
  items: { question: string; answer: string }[];
}

// The arranger reads these same cards as the public PhotoStream.
export const allPhotoStreamQuestions: PhotoStreamQuestionBlock[] = [
  {
    id: 'lake-garda',
    beforeImage: 'img-7532-jpg-d2d6ce7a.jpg',
    label: 'Lake Garda',
    layout: 'staggered',
    items: [
      { question: 'What made this holiday special?', answer: 'Elias was 13 months old and this was his very first foreign holiday. A trip full of firsts: his first time on an airplane, first time swimming, and first taste of authentic Italian gelato (lemon was his favourite). He even tried lobster 💁🏼‍♀️ So many lovely little family memories made.' },
      { question: 'What did you love about Lake Garda?', answer: 'We stayed in Lazise and I loved its laid-back lakeside atmosphere. We took the ferry to Sirmione, walked to Bardolino and spent sunny evenings strolling along the promenade. Sitting by the water with a glass of local wine and delicious Italian food — definitely my kind of holiday.' },
      { question: 'Did your camera come along?', answer: 'The Sony A7 IV stayed at home this time. I already had my hands full with a toddler, so I just brought my iPhone 15. It was lovely to keep things simple, enjoy being there together and still capture plenty of little moments along the way.' },
    ],
  },
  {
    id: 'phone',
    hidden: true,
    beforeImage: 'pale-waves-belfast.jpg',
    label: 'The camera in your pocket',
    items: [
      { question: 'Does a phone photo count?', answer: 'Of course. Some of my favourite small moments here were taken on a phone.' },
      { question: 'Why keep the camera details?', answer: 'I like remembering what I had with me when a picture happened, whether that was my Sony or my iPhone.' },
    ],
  },
  {
    id: 'dogs',
    beforeImage: 'dog-show-sept-2015-1-4-copy-21a8269d.jpg',
    label: 'Dog Shows',
    layout: 'staggered',
    items: [
      { question: 'How did you get into dog shows?', answer: 'I started going when I was 14 with my equally dog-obsessed auntie. I loved meeting so many different breeds in one place and chatting to their owners — a whole day of talking dogs with people just as obsessed as me. Each new breed felt like another entry in my own little Pokédex.' },
      { question: 'What are your favourite breeds?', answer: 'Easy answer: Australian Shepherds. I fell in love with them as a teenager and used to scour local dog shows hoping to spot one. I’m so happy I finally have one of my own. Hovawarts, Nova Scotia Duck Tolling Retrievers, Flat-Coated Retrievers and Japanese Akita Inus are also firmly on my favourites list.' },
    ],
  },
  {
    id: 'pictures',
    beforeImage: 'matisse-refinds-1-4.jpg',
    label: 'How It Started',
    layout: 'staggered',
    items: [
      { question: 'What got you into photography?', answer: 'Matisse, my little scruffy dog. I loved taking photos of him and wanted to take better ones, inspired by the talented photographers I followed on Flickr. At 17, I picked up a DSLR and brought together two of my favourite things: spending time with Matisse and taking pictures.' },
      { question: 'What camera did you start with?', answer: 'A second-hand Sony A100, an entry-level DSLR, with a couple of zoom lenses. It arrived just as I was heading to Rathlin Island with my family, so its first outing was photographing seals and beautiful Irish scenery. I’ve stayed with Sony since: first an A580, then an A7\u00a0II, and now an A7\u00a0IV.' },
    ],
  },
];

export const photoStreamQuestions = allPhotoStreamQuestions.filter(block => !block.hidden);
