export interface StoryMetadata {
  categories?: string[];
  subtitle?: string;
}

// Recovered from the original Exposure archive. Story prose remains in its
// Markdown file; this holds archive-level metadata that was missing locally.
export const storyMetadata: Record<string, StoryMetadata> = {
  '746862776d2576268afc65758bbab369': { categories: ['animals'] },
  'a-story-of-ice-and-fire': { categories: ['adventures'], subtitle: 'A Game of Thrones themed adventure' },
  'aint-nothin-but-a-hound-dog': { categories: ['pet sessions'], subtitle: 'Elvis the young Basset Hound & his family' },
  'an-afternoon-with-angus': { categories: ['pet sessions'], subtitle: 'Pet photoshoot in Clandeboye Estate' },
  'animals-afternoon-tea': { categories: ['animals'], subtitle: 'The best way to spend a birthday' },
  'barks-and-bows': { categories: ['animals'], subtitle: 'A Day at the Dog Show' },
  'big-world-little-dog': { categories: ['animals'], subtitle: 'Matisse explores Castle Park' },
  'boo-the-british-blue': { categories: ['pet sessions'] },
  'born-this-way-baby': { categories: ['live music'], subtitle: "Being Lady Gaga's Paparazzi" },
  'bring-your-dog-to-work-day': { categories: ['animals'] },
  'buffy-tess': { categories: ['pet sessions'], subtitle: 'Pet Photography Session' },
  'candy-basil': { categories: ['pet sessions'] },
  'cat-colony-of-cala-bona': { categories: ['animals'], subtitle: "Capturing the strays roaming Mallorca's streets" },
  'creatures': { categories: ['animals'], subtitle: "The inhabitants of C&J's Animal Park" },
  'designers-explorers': { categories: ['adventures'], subtitle: 'The Rumble Design Department Photography Trip' },
  'dogease': { categories: ['animals'] },
  'dogs-of-dubrovnik': { categories: ['animals'], subtitle: 'Zarkovica Animal Shelter' },
  'dubrovnik-and-cavtat': { categories: ['travel'], subtitle: 'Our Croatian Adventure' },
  'eckles': { categories: ['pet sessions'], subtitle: 'I adopted a hamster!' },
  'electric-pup': { categories: ['animals'] },
  'fall': { categories: ['adventures'], subtitle: 'Getting wet is half the fun' },
  'finn-pointer-puppy': { categories: ['pet sessions'], subtitle: 'Point + Shoot 📷' },
  'hybrid-conf': { categories: ['adventures'], subtitle: 'An extra special conference' },
  'lights': { categories: ['live music'], subtitle: 'Oh, you capture my attention' },
  'mutley-and-dexter': { categories: ['pet sessions'], subtitle: 'Partners in Crime' },
  'pet-expo-belfast': { categories: ['animals'], subtitle: 'An afternoon of animals in Titanic Exhibition Centre' },
  'playtime-with-bubba': { categories: ['pet sessions'], subtitle: 'Meet the adorable little Cocker Spaniel' },
  'poppy-the-labrador': { categories: ['pet sessions'] },
  'road-to-sligo': { categories: ['travel'], subtitle: 'Our Summer Adventure' },
  'roaming-rome': { categories: ['travel', 'adventures'], subtitle: 'Our Italian Adventure' },
  'sky-odin': { categories: ['pet sessions'] },
  'stablemates': { categories: ['animals', 'pet sessions'], subtitle: 'Hanging out with Jess the horse' },
  'take-a-walk-with-me': { categories: ['animals'], subtitle: 'Matisse explores the woods' },
  'the-ark': { categories: ['animals'], subtitle: 'A frosty Saturday morning at the farm' },
  'the-city-of-dublin': { categories: ['travel'], subtitle: 'Our Southern Weekend Adventure' },
  'the-lunatinks': { categories: ['pet sessions'] },
  'the-saltydog-dog-show': { categories: ['animals'], subtitle: 'Welcoming pedigrees and mutts of all shapes and sizes' },
  'vegas-baby': { categories: ['travel', 'adventures'], subtitle: 'Three Friends, One City' },
  'world-of-owls': { categories: ['animals'] },
};

export function categoriesForStory(id: string, categories: string[]): string[] {
  return storyMetadata[id]?.categories ?? categories;
}

export function subtitleForStory(id: string, subtitle: string | null | undefined): string | null | undefined {
  return storyMetadata[id]?.subtitle ?? subtitle;
}

// Exposure's original per-section editorial layouts. Keys are the source photo IDs,
// which remain stable even when local filenames carry a numeric sequence prefix.
export type StorySectionLayout = 'split' | 'split-reverse' | 'stacked' | 'stacked-centered' | 'full-bleed';

export const storySectionLayouts: Record<string, Record<string, StorySectionLayout>> = {
  "a-story-of-ice-and-fire": {
    "vftv6hkcibj1nhfrdtqi9awzyggy14iylik0": "full-bleed",
    "5zhhqgjurs02j4ib4csm0p9bbkjra4iu2hs9": "stacked",
    "oc2dpiw8z5154s4i0pjuj3utk49uow29fful": "full-bleed",
    "t1bbann66ky5jyvihx2o200xkyory66rgitb": "full-bleed",
    "kwdxej3y56z5b3xr9grfp9uwgrq0vn29kq2r": "stacked",
    "z8umjy9cp85xw29eym80pxqb9e8kt9bhzp6e": "stacked",
    "wx6nvkgs3ru4ygb9paw4bjq62vgqfr5ry57s": "full-bleed",
    "s1oyp62ufw53ik9d1dv2duckunjnhfr3ndwf": "stacked",
    "4wxx8jjquoo8byb9ottt197cry8bmx6rli71": "stacked"
  },
  "aint-nothin-but-a-hound-dog": {
    "40et0gy0ko61f4gbbtw3tkycumqb68zvslk6": "split-reverse",
    "zmnqqtziqag4dfo22k6itkow1nh191ce5l4m": "stacked",
    "kni0tiu897eekt3hfkjlgskoa36l3s7gdjc3": "full-bleed",
    "kfh2ct2o67ethouobkpegd5wd0cbyex2cnby": "full-bleed",
    "3cxs0sxlaheg5ep640bj6d0iruki47wws101": "stacked"
  },
  "an-afternoon-with-angus": {
    "yflf269i1m7lntz5ifzxfmetfgxo556c7qgz": "full-bleed",
    "sbdbytqbnz924hi5m4ss2no1flih8n9idu26": "stacked",
    "ozt2fwsv5fo9dri189zqanlv9f7uc3svyzwt": "full-bleed",
    "h8viz4azehp2ke6cjs76shfqax6quf456bs5": "stacked-centered"
  },
  "animals-afternoon-tea": {
    "1m1d8u04zwt495q8ouzw5mqzi9tahw4jhbw7": "full-bleed",
    "dvl0fs0ujcby614gt8ld6d3qh5cwvckldx2d": "full-bleed",
    "spxbwnxpeziijprixjky2piertyd5mdshvhh": "full-bleed"
  },
  "barks-and-bows": {
    "rt5dukszh7ojemi2pe726zd1tnjyvi5pmr0v": "stacked",
    "nlj5ns7au3e7mn29t7jusqovmxz85mi72zyi": "stacked",
    "fa07tos4kg3krzfrj4ihytx46unpcik9jyav": "full-bleed",
    "fncyaqwwyow7y14icinyb8ykn44mquxrqjlw": "full-bleed",
    "3a88kruoygqwu3div9234kdl9wscq5minb89": "stacked"
  },
  "big-world-little-dog": {
    "bvwp0svh7fn1m7vi6v2v6btc7bvs4iptl9s0": "stacked",
    "sod4fprv0a4itcvukoina6u07ldiomkiy4er": "full-bleed"
  },
  "born-this-way-baby": {
    "dhsm50eppiafw29i6xicbmjczl7hkt96xyf0": "stacked",
    "g1bmxpexkzeel8fr6trjf2ikplh257b92gfl": "full-bleed",
    "re1rfc1znkqn0zfrvc82r16xn5pl23xre3p1": "stacked",
    "70y2r57vff3fecdi74gcfn4i8hy0t3xrubf7": "full-bleed"
  },
  "buffy-tess": {
    "5k5a4v1yea5m5cw7xbgy3jwmco3dp1it264b": "stacked",
    "y85epb9vr1de37d1msdwv3mqhtkgcqhuocdu": "full-bleed",
    "yng6opfnoykozxkd3t6pljbgm8nl9st9z4sv": "full-bleed"
  },
  "cat-colony-of-cala-bona": {
    "7fcexfvrndayk3xrdac90kc78a198uxrk81a": "full-bleed",
    "js3pdnx5jz1wnrk9upz6jaoznjulq5miabla": "full-bleed",
    "shejh81nc6qiwwmiegy04clep5r35wmilih0": "full-bleed",
    "pqnvq89j23uwhfro2jseg3d4vgta9k9i47sn": "stacked"
  },
  "creatures": {
    "oqt9lukyj3syaya6t4por9wbtuqcvovuayc5": "stacked",
    "lfa1v58z8t37mjuzke9nvg1zzufvomosc2vy": "full-bleed",
    "o7t5wtzv5vgz5830q5qgckpqc34nrfzs0frv": "full-bleed",
    "69p2vq50q18sf3ji20xn8st6zy8kge28dihl": "full-bleed",
    "i79dbi4124p23zmbpn8jl8ccaz3g293we3v8": "full-bleed"
  },
  "designers-explorers": {
    "na3v8rrmv70vygb93ixbx118y1p58kt9o6o0": "full-bleed",
    "m25y3kh9sw3tyb9hi3mtcofz736jemi215n6": "full-bleed",
    "mon8eolv6hudte29k509tman8g6nu3dieyub": "full-bleed",
    "4c2p391ds0rg4x6rmsuajvd62jd1jorgcfuf": "full-bleed",
    "6ce28z61hep9o1orae2qhyap0dzbmx6ra4cw": "stacked"
  },
  "dogs-of-dubrovnik": {
    "9gk25hptq1wehkar6f8zo6kpw61bph614ypp": "split",
    "b4fab7enpt90tr1jeyt0fxudqjjafoa3fzuz": "full-bleed",
    "rljvukypjjawze36aps4qd9l1l4lroyoqvob": "full-bleed",
    "c53uz20rkvc8miz8i4jwor8z47dicnafo063": "split",
    "ndnqm3l3y1id1zsmx7i9b8a71ai4yk4pbwkg": "stacked-centered"
  },
  "dubrovnik-and-cavtat": {
    "5ygtu7eulv784a0qvnwgkmdxt2lemh5h84o3": "stacked-centered",
    "hml8620k5xiz6usubkpoml0rlo9i4x9anudz": "full-bleed",
    "dopfvhzng7onxbjh7ejiwa1p7y1ktd7msjoq": "stacked",
    "baz5rqmlazktd4ccj4ej4k0xh1175einkhqd": "full-bleed",
    "h97s4wcnx66r4u7l9gy7hjsjnwjacp6gr6h8": "full-bleed",
    "v8xhtgksgp3kih09it91fic7wxydk61dxeh0": "stacked",
    "yki1qlbi2n2onaep67qbik4gz9hhxhgoe10i": "full-bleed",
    "2pekqyd3uagw6gglu1ha9brqvxc9phwtei2v": "stacked-centered"
  },
  "eckles": {
    "gmgqtg1f9etj49siv9rt29rgrwykzjvx3vtx": "stacked",
    "l0paljdkvfmw6ee56vqj9hti36er85izipz3": "stacked"
  },
  "fall": {
    "tgfrkn5ne63tmx6ran27gsex6u0x80k9g45l": "stacked",
    "d88uihxi7jy8pvi13pe5uuf74vrhpvia7p7p": "full-bleed",
    "sqpen81kyw2n8kt9zmrz73jz92ju4n29qaj9": "full-bleed"
  },
  "finn-pointer-puppy": {
    "wls2sdkt8a9qr094bjgd1544h8kld9lo7d29": "stacked",
    "syi6hjzccnew30z6nkan1aha7kam8w1c2lnn": "full-bleed",
    "mik8qwr19es0cbs3w2riij79az17qphdolju": "stacked",
    "yb34b3byzcdxvll6af86vqo39suizaouq1ki": "full-bleed"
  },
  "hybrid-conf": {
    "lp8mubdfe2l3ow29miealgyfjvw019k9f1xs": "full-bleed",
    "e4me93a901s2lnmirvjcguchiio1or55347x": "full-bleed",
    "azncs1nqjpx03sori1vlj6ryq7k9ms4iy0kq": "full-bleed",
    "7ouryhrzuasgu8frer1ytmz2tricnmi0tqe2": "stacked",
    "x2faj7iviqvholxre0gr7ymc5t2csor6oxoe": "stacked"
  },
  "lights": {
    "9mgbgdndwo8ncdirn7h02o4wiwfjemivuuc2": "stacked",
    "q1bplzif2p8hbyb9w1n2xuwaanrejyviy5ka": "full-bleed",
    "0qj33b8he1li8uxr208ly1zkk7tzw7b99qgr": "full-bleed",
    "5wfecjhsk8bsm7vichpfw42mgq2xogvii05n": "stacked"
  },
  "mutley-and-dexter": {
    "cljvbh5uph0ydfaaphh2p4x6rdzv1pizxa0l": "stacked",
    "dssev5qe233x6zhtqqgbn8kt90cgqosie10y": "stacked",
    "l0458fzoivxdky58wmj2fyldiyvdhrjyw2ww": "full-bleed",
    "1mig7j89lidzcvk6x2uvwsif6rce7fzp7i95": "stacked",
    "ja9dscebamev4iium5julq5micwt96wibzt6": "full-bleed",
    "98j25zayrd6gjbpil54i5p14i69si0d1digz": "full-bleed",
    "hoty6b70wl3qvqka60wmnp14i1n3q031utm2": "stacked"
  },
  "pet-expo-belfast": {
    "jgx6fhis36bzvpecqjz10edr9wknlmxlj2d0": "stacked-centered",
    "asnkey1dcmbjgxa3gdwzoiqki38w0x4kznvf": "full-bleed",
    "nium11rprj70lnxy3mrbdb98i3hjzdqnqatt": "full-bleed",
    "0stawauizfq06228asvo6gh2yyrroeexlcow": "full-bleed",
    "kwp1jsovblhz52rtacybts4nlsuq43izo912": "stacked-centered"
  },
  "playtime-with-bubba": {
    "1ce5y6uy7v817zaxpc6rrrizfrdcd86eqfjh": "full-bleed",
    "ur6cgol4krgonbqfgodpldimn6jsxyfmused": "stacked",
    "hxgme6qdwx1sg5h5vwdqme7b97zjj37ahgbb": "full-bleed",
    "9pzf6sp0ii64qlccat1nvobt9seyuvydbzdp": "full-bleed"
  },
  "road-to-sligo": {
    "d0ojqc7az6aqazpo45ruth1tgwa5y4353wc8": "split",
    "eb36hyq4g3nnh578o8nrtnw924drtj2fdz0s": "full-bleed",
    "msjnlj764hi1p7g9d0w2k8j9jnt1ap6y94v0": "full-bleed",
    "7okefv553k6th8klegmfvjkeeje2zw65cyj3": "full-bleed",
    "3ecmtbb6n4888kqjaqi6i0tf8n13lfencyc7": "stacked-centered",
    "568qwngu1wsvolhslerd1pp7zmxe1rzdhlck": "stacked-centered",
    "31vuxar2z14v1nwxu4v2kav3z547eo2dmvm6": "full-bleed",
    "ic99t4yizij85n6fiq0t0ogq66erz6c75sfk": "stacked",
    "10wmw6ecs92clwwn4df56fr507gd2hqkr7su": "full-bleed",
    "ycqs90s506b7g33lvzz8hffk67r85avehywk": "stacked-centered",
    "rnckas3vlqhg0nr4gjckvetshtlkug6n8fjd": "full-bleed",
    "18ws24t1as3jk16geyp1vox1kmpqkdc7e28w": "full-bleed",
    "8f4cmpoupekmqc1ull6kapjt9e7m32erfjim": "stacked"
  },
  "roaming-rome": {
    "hik646essztyzzzg1w1inqaortzk4bey81hj": "full-bleed",
    "22ezqxy7y0oadso20gkptu766r1x2ntdr28f": "stacked",
    "b66n1p2nkxbsjivm0lvdkj4iblyy1lra08jg": "full-bleed",
    "l027pgn0rb0o2h3woe15uerk9ak29798qhpt": "stacked",
    "12bw0evr2kbxnc94wzvx61dcxr9webjnx9u3": "full-bleed",
    "8lb0w0kixym4fff5etudxnu3diy2m9fdqxr1": "stacked",
    "ff7o8lnzxxxdzdpdxp4jnstt9um293yp0jl9": "stacked"
  },
  "stablemates": {
    "yk4hrzutpmwbfbt9acn0qe923ya7zaor9vg0": "full-bleed",
    "gp65w93nm56ogvi96t8g5nn82npnwmi9mp3x": "full-bleed",
    "6dsb8chf4j35l8frkov3rljds763whfrkejn": "stacked"
  },
  "take-a-walk-with-me": {
    "v2qpdmsbzwk4kj4iv6rkgr3okkzf47vigqj1": "stacked",
    "f351e2bper6q1tt90s2kwxmeraglow29rn75": "full-bleed",
    "ry3vv8qa5e7phkt9h9pckyysnm8qto6rvpfm": "full-bleed"
  },
  "the-ark": {
    "97ltpb52c8xjq0k90ri38ty798k9be290bvzcogh": "full-bleed",
    "q6igyjgyx0ztzkt9hzp0wupy470vygb9n5gossfy": "full-bleed",
    "hg5p4w2sz7low298w1fqmh91azia4ippnlneg0tq": "full-bleed",
    "kvrpsqjpmla6ecdigpe4qyvlyk6s9k9dy6o964hj": "full-bleed",
    "1c91rekge7lxflxrblvwwux0lq7rdx6roioqmfmx": "stacked"
  },
  "the-city-of-dublin": {
    "owe0yecfivrc0udiqi9ohnqhvfwjc3diu5uj": "full-bleed",
    "h20h6pddmb73nmid18qe1wywtcblnmi2bjya": "full-bleed",
    "mnlxy356ng17cik9mfegthyz43oko6rzugnv": "full-bleed",
    "1n0loixgsx3fecdi55cd6786eb4ndn295e72": "full-bleed",
    "38sgnbk9po8q6w29hvn2h70ycjt3mcxrwkxw": "full-bleed"
  },
  "the-saltydog-dog-show": {
    "hpclh3mzlgx5stt9u277fpdqj8h3erk9kxkj": "stacked",
    "bxzvjgiokgpn9udie9dgmavr71fw293nwstb": "full-bleed",
    "8ss6qvtkw4l07ldiacm1mlvxzcymbo6rsvs0": "full-bleed",
    "7ojo2b5j8xna5rk9fyvwztac35hoajoroh3g": "full-bleed",
    "mz2b8wuqwge0o1orz6u08tkx481wnrk9dnua": "full-bleed",
    "oi2nfaycufxkcsoriyz2rho10wfjemilblgb": "stacked"
  },
  "vegas-baby": {
    "284n0su4ue686ddtxzsdkd2jwx4y2lfnxnbs": "full-bleed",
    "5oinlu6qfyiwzpsqs5pvbev6izqk6wjbrjcj": "full-bleed",
    "j7do936x3cf2irv84bqtxee1mzi2jal84x46": "stacked-centered",
    "kc5hfu8r3udggs6ur5grzio2grecvhasz3xz": "stacked-centered"
  }
};

export function layoutForStorySection(id: string, photos: string[]): StorySectionLayout | undefined {
  const layouts = storySectionLayouts[id];
  const firstPhoto = photos[0]?.replace(/^.*\//, '').replace(/^[0-9]+-/, '').replace(/\.[^.]+$/, '');
  if (!layouts || !firstPhoto) return undefined;
  return Object.entries(layouts).find(([sourceId]) => firstPhoto.endsWith(sourceId))?.[1];
}

// Exposure's cover treatment: most stories use a full-image overlay, while these
// stories use the two-fold image-and-text cover.
export const storyCoverStyles: Record<string, 'full' | 'split'> = {
  "an-afternoon-with-angus": "split",
  "animals-afternoon-tea": "split",
  "creatures": "split",
  "eckles": "split",
  "finn-pointer-puppy": "split",
  "pet-expo-belfast": "split"
};

export function coverStyleForStory(id: string, fallback: 'full' | 'split'): 'full' | 'split' {
  return storyCoverStyles[id] ?? fallback;
}
