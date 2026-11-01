export interface PhotoStreamQuestionBlock {
  id: string;
  beforeImage: string;
  label: string;
  layout?: 'two-column';
  hidden?: boolean;
  items: { question: string; answer: string }[];
}

// The arranger reads these same cards as the public PhotoStream.
export const allPhotoStreamQuestions: PhotoStreamQuestionBlock[] = [
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
    hidden: true,
    beforeImage: 'barcelona-2023-6.jpg',
    label: 'Dogs and dog shows',
    items: [
      { question: 'Have you ever shown a dog?', answer: 'I competed in conformation shows for a short while. I enjoyed the training, but these days I prefer watching from the sidelines with my camera.' },
      { question: 'A breed you always come back to?', answer: 'Australian Shepherds. I fell down a very deep rabbit hole learning about them.' },
      { question: 'Any other favourites?', answer: 'Hovawarts and Nova Scotia Duck Tolling Retrievers are up there too.' },
    ],
  },
  {
    id: 'pictures',
    beforeImage: 'pale-waves-belfast.jpg',
    label: 'Behind the pictures',
    layout: 'two-column',
    items: [
      { question: 'What got you into photography?', answer: 'Matisse, my little scruffy dog. I loved taking photos of him and wanted to take better ones, inspired by the talented photographers I followed on Flickr. At 17, I picked up a DSLR and brought together two of my favourite things: spending time with Matisse and taking pictures.' },
      { question: 'What camera did you start with?', answer: 'A second-hand Sony A100, an entry-level DSLR, with a couple of zoom lenses. It arrived just as I was heading to Rathlin Island with my family, so its first outing was photographing seals and beautiful Irish scenery. I’ve stayed with Sony since: first an A580, then an A7\u00a0II, and now an A7\u00a0IV.' },
    ],
  },
];

export const photoStreamQuestions = allPhotoStreamQuestions.filter(block => !block.hidden);
