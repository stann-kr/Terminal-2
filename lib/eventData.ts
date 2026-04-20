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
  guestLimit?: number;
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
  invitationLines?: {
    en: string[];
    ko: string[];
  };
  description?: {
    en: string;
    ko: string;
  };
  posterUrl?: string;
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
    description: {
      ko: "항성풍 영향권 이탈.\n헬리오포즈(Heliopause) 돌파.\n\n태양계의 경계를 넘어섬에 따라,\n익숙했던 외부의 간섭 신호는 완벽히 차단됩니다.\n\n이번 정거장부터 우리는 얕은 궤도를 벗어나\n훨씬 깊고 짙어진 사운드 환경으로 진입할 예정입니다.\n\n오직 공간을 채우는 파동에만 의지한 채\n심연으로의 항해를 이어갈\n새로운 주체들을 호출합니다.",
      en: "Leaving the heliosphere.\nBreaching the Heliopause.\n\nAs we cross the boundary of the solar system,\nfamiliar external interference signals\nwill be completely blocked.\n\nFrom this station onward,\nwe will depart from shallow orbits\nand enter a much deeper, denser sound environment.\n\nWe now call upon entities\nto continue the voyage into the abyss,\nrelying solely on the waves that fill the space.",
    },
    // posterUrl: "https://your-r2-bucket.r2.dev/trm-02-poster.jpg",
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
    description: {
      ko: "시스템 초기화 및 코어 가동 완료.\n\n정지해 있던 터미널에 첫 번째 진동이 출력되며,\n흩어져 있던 주체들을 하나의 공간으로 불러 모았습니다.\n\n일상의 좌표를 지우고\n미지의 영역(Unknown Sector)을 향해 이륙했던\n터미널의 첫 번째 비행 로그입니다.",
      en: "System initialization and core activation complete.\n\nAs the first vibration resonated\nthrough the dormant Terminal,\nscattered entities were brought together\ninto a single space.\n\nThis is the first flight log of the Terminal,\ntaking off toward the Unknown Sector\nwhile erasing everyday coordinates.",
    },
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
