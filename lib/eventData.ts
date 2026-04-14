export type EventStatus = "UPCOMING" | "LIVE" | "ARCHIVED";
export type ArtistStatus =
  | "CONFIRMED"
  | "CLASSIFIED"
  | "PENDING"
  | "ARCHIVED"
  | "AWAITING DECRYPTION";

export interface ArtistDescription {
  en: string | string[];
  ko: string | string[];
}

export interface Artist {
  id: string;
  name: string;
  origin: string;
  dock: string;
  time: string;
  status: ArtistStatus;
  description?: ArtistDescription | string | string[];
}

export interface TerminalEvent {
  id: string;
  session: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  district: string;
  coords: string;
  capacity: string;
  sound: string;
  status: EventStatus;
  artists: Artist[];
  accessCode?: string;
  invitationLines?: string[];
}

export const EVENTS: TerminalEvent[] = [
  {
    id: "TRM-02",
    session: "TERMINAL [02]",
    subtitle: "Heliopause Outskirts",
    date: "2026-05-08",
    time: "23:00 KST",
    venue: "FAUST SEOUL",
    district: "YONGSAN-GU // ITAEWON",
    coords: "37.5335° N, 126.9958° E",
    capacity: "CAPACITY: CLASSIFIED",
    sound: "KIRSCH AUDIO SYSTEM",
    status: "UPCOMING",
    artists: [
      {
        id: "02-A",
        name: "STANN LUMO",
        origin: "KR",
        dock: "1",
        time: "TBA",
        status: "CONFIRMED",
        description: [
          "TERMINAL RESIDENT // SEOUL",
          "SONIC ARCHITECT SPECIALIZING IN HIGH-DENSITY, INDUSTRIAL TEXTURES",
          "BLENDING RAW ANALOG HARDWARE WITH PRECISION DIGITAL PROCESSING.",
          "",
          "> RECENT ACTIVITY:",
          "  - 'OBSIDIAN CORE' EP [TERMINAL RECORDS, 2025]",
          "  - FAUST SEOUL RESIDENCY [2024-PRESENT]",
          "",
          "KNOWN FOR RELENTLESS KICK DRUMS AND HYPNOTIC, METALLIC PERCUSSION",
          "THAT DISORIENTS AND RECONSTRUCTS THE DANCEFLOOR DYNAMICS."
        ],
      },
      {
        id: "02-B",
        name: "[ ENCRYPTED ]",
        origin: "--",
        dock: "1",
        time: "TBA",
        status: "AWAITING DECRYPTION",
      },
      {
        id: "02-C",
        name: "[ ENCRYPTED ]",
        origin: "--",
        dock: "1",
        time: "TBA",
        status: "AWAITING DECRYPTION",
      },
      {
        id: "02-D",
        name: "[ ENCRYPTED ]",
        origin: "--",
        dock: "2",
        time: "TBA",
        status: "AWAITING DECRYPTION",
      },
      {
        id: "02-E",
        name: "[ ENCRYPTED ]",
        origin: "--",
        dock: "2",
        time: "TBA",
        status: "AWAITING DECRYPTION",
      },
    ],
  },
  {
    id: "TRM-01",
    session: "TERMINAL [01]",
    subtitle: "Departure Notice",
    date: "2025-03-07",
    time: "23:00 KST",
    venue: "FAUST SEOUL",
    district: "YONGSAN-GU // ITAEWON",
    coords: "37.5335° N, 126.9958° E",
    capacity: "200 NODES MAX",
    sound: "KIRSCH AUDIO SYSTEM",
    status: "ARCHIVED",
    artists: [
      {
        id: "01-A",
        name: "STANN LUMO",
        origin: "KR",
        dock: "1",
        time: "01:00–02:30",
        status: "ARCHIVED",
      },
      {
        id: "01-B",
        name: "MARCUS L",
        origin: "KR",
        dock: "1",
        time: "23:00–01:00",
        status: "ARCHIVED",
      },
      {
        id: "01-C",
        name: "NUSNOOM",
        origin: "KR",
        dock: "1",
        time: "02:30–05:00",
        status: "ARCHIVED",
      },
    ],
  },
];

export const UPCOMING_EVENT =
  EVENTS.find((e) => e.status === "UPCOMING") ?? EVENTS[0];
export const ARCHIVED_EVENTS = EVENTS.filter((e) => e.status === "ARCHIVED");
