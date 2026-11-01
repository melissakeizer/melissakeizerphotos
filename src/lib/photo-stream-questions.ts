export interface PhotoStreamQuestionBlock {
  id: string;
  beforeImage: string;
  label: string;
  items: { question: string; answer: string }[];
}

// The arranger reads these same cards as the public PhotoStream.
export const photoStreamQuestions: PhotoStreamQuestionBlock[] = [
  {
    id: 'phone',
    beforeImage: 'pale-waves-belfast.jpg',
    label: 'The camera in your pocket',
    items: [
      { question: 'Does a phone photo count?', answer: 'Of course. Some of my favourite small moments here were taken on a phone.' },
      { question: 'Why keep the camera details?', answer: 'I like remembering what I had with me when a picture happened, whether that was my Sony or my iPhone.' },
    ],
  },
  {
    id: 'dogs',
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
    beforeImage: '05-orca-11-months-stacked-p1-2.jpg',
    label: 'Behind the pictures',
    items: [
      { question: 'Which lens do you reach for most?', answer: 'My Sony 55mm f/1.8. It’s gorgeously sharp, gives me beautiful depth of field and I like the constraint of zooming with my feet.' },
      { question: 'What do you most enjoy photographing now?', answer: 'Animals, always—but I’m also enjoying exploring automotive photography and finding a new visual language for it.' },
      { question: 'What got you into photography?', answer: 'Wanting to hold onto the small details: live music, animals, journeys and the ordinary scenes that become meaningful later.' },
    ],
  },
];
