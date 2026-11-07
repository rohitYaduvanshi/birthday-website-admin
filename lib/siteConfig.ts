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
    showPreviewButton: true, // Set to false before sharing with recipient
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
    "/ref/girl1.jpg",
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
    "Your smile is my favorite memory",
    "Every little moment with you counts",
    "You make the whole world softer",
    "Forever grateful for your warmth",
    "May your brightest days be ahead",
    "The way you laugh makes my day",
    "Another year of pure joy with you",
    "You are magic in human form",
    "To many more adventures together",
    "Happy Birthday my favourite person",
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
      text: "You turned ordinary days into ones worth remembering. Thank you for simply existing.",
      accent: "#C49A45",
    },
    {
      id: "n3",
      title: "03",
      text: "If I could replay one chapter of my life, I'd pick every minute I spent laughing with you.",
      accent: "#7A9E7E",
    },
    {
      id: "n4",
      title: "04",
      text: "Another year older, but you still manage to be the prettiest thing in every room you enter.",
      accent: "#8E7AA0",
    },
    {
      id: "n5",
      title: "05",
      text: "I hope today reminds you of how deeply you are cherished, today and all the days after.",
      accent: "#B86B77",
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
    // 1. Check if config is provided via URL hash (for recipient link sharing)
    if (window.location.hash && window.location.hash.startsWith("#cfg=")) {
      try {
        const encoded = window.location.hash.slice(5);
        const decoded = decodeURIComponent(escape(atob(encoded)));
        const parsedFromUrl = JSON.parse(decoded);
        if (parsedFromUrl && parsedFromUrl.person) {
          const merged = { ...defaultSiteConfig, ...parsedFromUrl };
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn("Failed to parse config from URL hash", err);
      }
    }

    // 2. Read from localStorage
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

let _channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!_channel) {
    try {
      _channel = new BroadcastChannel("birthday_config_sync");
    } catch {
      _channel = null;
    }
  }
  return _channel;
}

export function saveClientConfig(config: SiteConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    // Notify same tab
    window.dispatchEvent(new Event("site_config_updated"));
    // Notify all other tabs via BroadcastChannel
    getChannel()?.postMessage({ type: "config_updated", config });
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}
