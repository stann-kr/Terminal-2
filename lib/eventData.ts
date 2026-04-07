export type EventStatus = "UPCOMING" | "LIVE" | "ARCHIVED";
export type ArtistStatus = "CONFIRMED" | "CLASSIFIED" | "PENDING";

export interface Artist {
  id: string;
  name: string;
  origin: string;
  genre: string;
  time: string;
  status: ArtistStatus;
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
  dressCode: string;
  ageRestriction: string;
  sound: string;
  status: EventStatus;
  artists: Artist[];
}

export const EVENTS: TerminalEvent[] = [
  {
    id: "TRM-02",
    session: "TERMINAL [02]",
    subtitle: "Heliopause Outskirts",
    date: "2026-05-08",
    time: "23:00 KST",
    venue: "CLASSIFIED_LOCATION_B",
    district: "SEONGDONG-GU // SECTOR-12",
    coords: "37.5636° N, 127.0369° E",
    capacity: "300 NODES MAX",
    dressCode: "ALL BLACK MANDATORY",
    ageRestriction: "18+ ONLY",
    sound: "FUNKTION-ONE / CUSTOM RIG",
    status: "UPCOMING",
    artists: [
      {
        id: "TRM-02-001",
        name: "DJ1",
        origin: "UK",
        genre: "TECHNO",
        time: "23:00–01:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-02-002",
        name: "DJ2",
        origin: "UK",
        genre: "TECHNO",
        time: "01:00–03:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-02-003",
        name: "DJ3",
        origin: "UK",
        genre: "TECHNO",
        time: "03:00–05:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-02-004",
        name: "DJ4",
        origin: "KR",
        genre: "TECHNO",
        time: "05:00–07:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-02-005",
        name: "DJ5",
        origin: "SE",
        genre: "TECHNO",
        time: "07:00–09:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-02-006",
        name: "[REDACTED]",
        origin: "??",
        genre: "??? / CLASSIFIED",
        time: "09:00–10:00",
        status: "CLASSIFIED",
      },
    ],
  },
  {
    id: "TRM-01",
    session: "TERMINAL [01]",
    subtitle: "Signal Origin",
    date: "2026-03-14",
    time: "23:00 KST",
    venue: "CLASSIFIED_LOCATION_A",
    district: "MAPO-GU // SECTOR-7",
    coords: "37.5480° N, 126.9975° E",
    capacity: "200 NODES MAX",
    dressCode: "ALL BLACK MANDATORY",
    ageRestriction: "18+ ONLY",
    sound: "FUNKTION-ONE / CUSTOM RIG",
    status: "ARCHIVED",
    artists: [
      {
        id: "TRM-01-001",
        name: "DJ1",
        origin: "SE",
        genre: "TECHNO",
        time: "23:00–01:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-01-002",
        name: "DJ2",
        origin: "UK",
        genre: "TECHNO",
        time: "01:00–03:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-01-003",
        name: "DJ3",
        origin: "UK",
        genre: "TECHNO",
        time: "03:00–05:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-01-004",
        name: "DJ4",
        origin: "KR",
        genre: "TECHNO",
        time: "05:00–07:00",
        status: "CONFIRMED",
      },
      {
        id: "TRM-01-005",
        name: "DJ5",
        origin: "KR",
        genre: "TECHNO",
        time: "07:00–09:00",
        status: "CONFIRMED",
      },
    ],
  },
];

export const UPCOMING_EVENT =
  EVENTS.find((e) => e.status === "UPCOMING") ?? EVENTS[0];
export const ARCHIVED_EVENTS = EVENTS.filter((e) => e.status === "ARCHIVED");
