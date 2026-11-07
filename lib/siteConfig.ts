export interface PersonConfig {
  name: string;
  nickname: string;
  heroDateBadge: string;
  heroWishMessage: string;
}

export interface CountdownConfig {
  targetDate: string;
  tickerText: string;
  marqueeTitle: string;
  marqueeSub: string;
  doorsText: string;
  showPreviewButton: boolean;
}

export interface MusicConfig {
  songSrc: string;
  songTitle: string;
  songArtist: string;
}

export interface BirthdayCounterConfig {
  birthDate: string;
  age: number;
  bgRevealImage: string;
}

export interface ButterflyNote {
  id: string;
  title: string;
  text: string;
  accent: string;
}

export interface GalaxyCard {
  id: string;
  title: string;
  alt: string;
}

export interface ChatStoryConfig {
  avatar: string;
  headerTitle: string;
  messages: string[];
}

export interface AdminConfig {
  pin: string;
}

export interface SiteConfig {
  person: PersonConfig;
  countdown: CountdownConfig;
  music: MusicConfig;
  birthdayCounter: BirthdayCounterConfig;
  photos: string[];
  loveGalleryCaptions: string[];
  butterflyNotes: ButterflyNote[];
  galaxyCards: GalaxyCard[];
  chatStory: ChatStoryConfig;
  admin: AdminConfig;
}

export const defaultSiteConfig: SiteConfig = {
  person: {
    name: "Sweety",
    nickname: "sidd's pipi ♥️",
    heroDateBadge: "Aug 5",
    heroWishMessage:
      "wishing you a day filled with love, laughter, and all the happiness your heart can hold. May this year bring you endless joy and unforgettable memories. Happy Birthday!",
  },
  countdown: {
    targetDate: "2026-11-11T00:00:00+05:30",
    tickerText: "SAVE THE DATE · NOV 11 ·",
    marqueeTitle: "NOW SHOWING",
    marqueeSub: "a Pipi production, live NOV 11th",
    doorsText: "doors open at midnight, IST",
    showPreviewButton: true,
  },
  music: {
    songSrc: "/sounds/pipi-song.mp3",
    songTitle: "Sweety Song",
    songArtist: "Birthday Playlist",
  },
  birthdayCounter: {
    birthDate: "2003-08-05T00:00:00",
    age: 23,
    bgRevealImage: "/bg2.jpg",
  },
  photos: [
    "/ref/heart.jpg",
    "/ref/girl.jpg",
    "/ref/girl2.jpg",
    "/ref/girl3.jpg",
    "/ref/girl4.jpg",
    "/ref/girl5.jpg",
    "/ref/girl6.jpg",
    "/ref/girl7.jpg",
    "/ref/girl8.jpg",
    "/ref/girl9.jpg",
    "/ref/girl10.jpg",
    "/ref/girl11.jpg",
  ],
  loveGalleryCaptions: [
    "Cutie 🥹",
    "Baddie 😎",
    "Pretty ✨",
    "My Love 🤍",
    "Sunshine ☀️",
    "Angel 🪽",
    "Beautiful 🌸",
    "Dream Girl 💫",
    "Queen 👑",
    "Always You 🫶",
  ],
  butterflyNotes: [
    {
      id: "n1",
      title: "01",
      text: "Every butterfly escapes... except me. I've been happily stuck with you since day one. 🤍",
      accent: "#D98E7E",
    },
    {
      id: "n2",
      title: "02",
      text: "Is butterfly ki tarah meri har khushi ka raasta bhi aakhir tum tak hi aakar rukta hai. 🫶",
      accent: "#C9A15E",
    },
    {
      id: "n3",
      title: "03",
      text: "Tumne butterfly ko touch kiya... aur meri heartbeat phir se skip kar gayi. 😭❤️",
      accent: "#7E9C68",
    },
    {
      id: "n4",
      title: "04",
      text: "Looks like you're really good at catching butterflies... no wonder you caught my heart so easily. ❤️",
      accent: "#B27A94",
    },
    {
      id: "n5",
      title: "05",
      text: "This butterfly landed in your hands for a moment... my heart chose to stay there forever. 🦋",
      accent: "#7C8FA6",
    },
  ],
  galaxyCards: [
    { id: "1", title: "Cutie", alt: "Cutie" },
    { id: "2", title: "Baddie", alt: "Baddie" },
    { id: "3", title: "Angel", alt: "Angel" },
    { id: "4", title: "Dreamgirl", alt: "Dreamgirl" },
    { id: "5", title: "Sweetheart", alt: "Sweetheart" },
    { id: "6", title: "Icon", alt: "Icon" },
    { id: "7", title: "Stunner", alt: "Stunner" },
    { id: "8", title: "Babe", alt: "Babe" },
    { id: "9", title: "Darling", alt: "Darling" },
    { id: "10", title: "Sunshine", alt: "Sunshine" },
    { id: "11", title: "Queen", alt: "Queen" },
    { id: "12", title: "Heartbreaker", alt: "Heartbreaker" },
  ],
  chatStory: {
    avatar: "/ref/girl1.jpg",
    headerTitle: "sidd's pipi ♥️",
    messages: [
      "Happppyeee birthday love,",
      "ik last bday pr ek problem hogyi thi isliye ye wala bilkul special banana chahta hu,",
      "i hope ye dekh ke apke chotu se face pe ek badi si smile to aai hogi,",
      "nahi bhi aai to kal 11 baje se or surprises milna start ho jayengeee,",
      "Afterall m hito hu jiski responsibility h wo smile maintain krna 😭",
      "Happppyeee birthday love 🫶",
    ],
  },
  admin: {
    pin: "1111",
  },
};

export const CONFIG_STORAGE_KEY = "birthday_site_config_v1";

export function getClientConfig(): SiteConfig {
  if (typeof window === "undefined") return defaultSiteConfig;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSiteConfig, ...parsed };
    }
  } catch (e) {
    console.error("Failed to read localStorage config", e);
  }
  return defaultSiteConfig;
}

export function saveClientConfig(config: SiteConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("site_config_updated"));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

