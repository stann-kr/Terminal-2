/** 홈 DIRS 설명 — KO */
export const dirDescKo: Record<string, string> = {
  about: "플랫폼 매니페스토 / 시스템 정보",
  gate: "이벤트 안내 / 카운트다운 / 게스트 신청",
  lineup: "아티스트 라인업 / 도크",
  status: "시스템 진단 / 네트워크 텔레메트리",
  transmit: "방문자 로그",
  signal: "소식 구독 / 마케팅 수신 신청",
  link: "외부 채널 / 공식 링크",
};

/** About 페이지 MANIFESTO — KO */
export const manifestoKo: string[] = [
  "TERMINAL",
  "A Voyage to the Unknown Sector.",
  "",
  "TERMINAL은",
  "서울 기반의 플랫폼입니다.",
  "",
  "[ DEFINITION ]",
  "터미널은 단순한 이벤트가 아닙니다.",
  "",
  "이곳은 다양한 형태의 감각과",
  "사람들이 모여드는 정거장이자,",
  "",
  "미지의 영역(Unknown Sector)을 향해",
  "함께 떠나는 여정의 출발점입니다.",
  "",
  "[ DESIGN PRINCIPLE ]",
  "우리는 불필요한 시각적 노이즈를 덜어내고,",
  "꼭 필요한 빛과 소리만으로 공간을 채웁니다.",
  "",
  "오직 텍스트로만 본질에 접근하는",
  "CLI(Command Line Interface) 시스템처럼,",
  "",
  "화려한 장식보다는 경험 그 자체에",
  "깊게 빠져들 수 있는 미니멀한 환경을 지향합니다.",
  "",
  "[ OBJECTIVE ]",
  "TERMINAL은 일방적인 관람을 위한 무대가 아닙니다.",
  "",
  "이곳에 발을 들인 모든 사람은",
  "공간을 완성하는 주체입니다.",
  "",
  "우리는 이 공간을 매개로 모두가 교감하며,",
  "끝없이 나아가는 거대한 흐름 안에서",
  "완전하게 연결되는 순간을 지향합니다.",
  "",
  "Terminal Architect : STANN LUMO",
];

// ─────────────────────────────────────────────
// COMMON (공통)
// ─────────────────────────────────────────────

export const commonKo = {
  signalUnstable: "⚠ 신호 링크 불안정",
  dbUnreachable: "데이터베이스 연결 실패 — 나중에 재시도",
};

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────

export const homeKo = {
  nextEntry: "다음 발사 —",
  rootDir: "▶ 루트 디렉토리 — /terminal/",
  moduleCount: "6 모듈",
};

// ─────────────────────────────────────────────
// GATE
// ─────────────────────────────────────────────

export const gateKo = {
  tabUpcoming: "▶ 예정",
  tabArchive: "◼ 아카이브",
  loading: "▸ 게이트 데이터 로딩 중...",
  requestBtn: "▶ 게스트 신청",
  archivedLabel: "◼ 아카이브됨",
  locationWarning: "⚠ 세션 참가를 위한 상세 위치 및 게이트 정보입니다.",
  /** `◼ 세션 종료 — ${date}` */
  sessionArchived: (date: string) => `◼ 세션 종료 — ${date}`,
  eventInfoTitle: "EVENT_INFO.dec",
};

// ─────────────────────────────────────────────
// GATE / REQUEST ACCESS
// ─────────────────────────────────────────────

export const requestKo = {
  loading: "▸ 신청 데이터 로딩 중...",
  periodInactive: "⚠ 신청 기간 아님",
  /** `다음 신청 가능 기간은 이벤트 ${days}일 전에 열립니다` */
  windowInfo: (days: number) =>
    `다음 신청 가능 기간은 이벤트 ${days}일 전에 열립니다`,
  eventDate: (date: string, time: string) => `이벤트 날짜 — ${date} · ${time}`,
  /** `신청 가능까지 T-${n}일` */
  windowCountdown: (n: number) => `신청 가능까지 T-${n}일`,
  noEvent: "예정된 이벤트 없음. 나중에 다시 확인하세요.",
  committed: "✓ 신청 완료",
  committedSub: "여정에 함께해 주셔서 감사합니다.",
  invitationLines: [
    "이 채널에 대한 접근 권한이 부여되었습니다.",
    "이 초대는 개인적이며 양도 불가합니다.",
    "TERMINAL은 RSVP 기반 이벤트입니다 — 신청 절차를 완료해주세요.",
    "입장 심사를 위해 아래 양식을 작성해 제출하세요.",
    "인증 코드가 필요합니다. 없는 경우 초대인에게 문의하세요.",
  ],
  // 폼 레이블
  labelCode: "인증 코드:",
  labelInvitedBy: "초대인:",
  labelName: "이름:",
  labelEmail: "이메일:",
  labelInstagram: "인스타그램 ID:",
  // 플레이스홀더
  placeholderCode: "세션 인증 코드",
  placeholderInvitedBy: "초대인 이름",
  placeholderName: "전체 이름",
  placeholderEmail: "이메일@주소.COM",
  placeholderInstagram: "@사용자명",
  // 개인정보 동의
  privacyConsent:
    "이름·이메일·인스타그램 ID를 게스트 접근 관리 목적으로 수집합니다. 보존 기간: 이벤트 종료 후 1개월. 제3자 미공개.",
  marketingConsent:
    "[선택] 차기 이벤트 신호를 이메일·인스타그램 채널로 수신합니다. 보존 기간: 수신 거부 시까지.",
  // 버튼
  submitting: "▸ 전송 중...",
  submitBtn: "▶ 신청 제출",
  // 초대인 선택
  invitedByOther: "기타",
  invitedByOtherPlaceholder: "초대인 이름 직접 입력",
  // 에러
  errors: {
    ALL_FIELDS_REQUIRED: "모든 항목을 입력해주세요.",
    PRIVACY_CONSENT_REQUIRED: "개인정보 동의가 필요합니다.",
    INVALID_EMAIL_FORMAT: "이메일 형식이 올바르지 않습니다.",
    INVALID_INPUT: "입력값이 올바르지 않습니다.",
    INVALID_INSTAGRAM_FORMAT: "인스타그램 형식이 올바르지 않습니다.",
    NO_UPCOMING_EVENT: "예정된 이벤트가 없습니다.",
    REQUEST_PERIOD_INACTIVE: "신청 기간이 아닙니다.",
    INVALID_ACCESS_CODE: "유효하지 않은 인증 코드입니다.",
    GUEST_LIMIT_REACHED: "해당 코드의 게스트 정원이 마감되었습니다.",
    EMAIL_ALREADY_REGISTERED: "이미 등록된 이메일입니다.",
    INTERNAL_SERVER_ERROR: "전송 실패. 나중에 다시 시도하세요.",
    TRANSMISSION_FAILED: "전송 실패.",
    CONNECTION_ERROR: "전송 실패. 연결을 확인하세요.",
  },
};

// ─────────────────────────────────────────────
// LINEUP
// ─────────────────────────────────────────────

export const lineupKo = {
  loading: "▸ 라인업 데이터 로딩 중...",
  upcomingTag: "예정",
  /** `${n} 아티스트` */
  actCount: (n: number) => `${n} 아티스트`,
  colArtist: "아티스트",
  colTimeslot: "타임슬롯",
  colStatus: "상태",
  footerUpcoming: "— 추가 라인업 복호화 중 — 대기 —",
  footerArchived: "— 섹터 01 완료 — 아날로그 데이터 소거됨 —",
  /** `도크 ${dock}` */
  dock: (dock: string) => `도크 ${dock}`,
};

// ─────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────

export const statusKo = {
  labelSessionsRun: "진행 세션",
  labelNextLaunch: "다음 발사",
  labelArtistNodes: "참여 아티스트",
  unitArchived: "SESSIONS",
  unitStandby: "STANDBY",
  unitConfirmed: "ARTISTS",
  sessionLogTitle: "SESSION_LOG.rec",
  colSession: "세션",
  colDate: "날짜",
  colArtists: "아티스트",
  colStatus: "상태",
  loading: "▸ 시스템 데이터 로딩 중...",
  noSessions: "기록된 세션 없음.",
};

// ─────────────────────────────────────────────
// TRANSMIT
// ─────────────────────────────────────────────

export const transmitKo = {
  labelAlias: "별칭:",
  labelMessage: "메시지:",
  placeholderAlias: "별칭 입력",
  placeholderMsg: "데이터베이스에 기록...",
  committed: "✓ 신호 전송 완료",
  submitting: "▸ 전송 중...",
  submitBtn: "▶ 신호 전송",
  syncing: "▸ 데이터베이스 동기화 중...",
  noEntries: "기록 없음.",
  /** `신호 로그 — ${n}개 기록` */
  logTitle: (n: number) => `신호 로그 — ${n}개 기록`,
  logSyncing: "신호 로그 — 동기화 중...",
  prevBtn: "◀ 이전",
  nextBtn: "다음 ▶",
  errors: {
    required: "별칭과 메시지를 입력해주세요.",
    tooLong: "메시지가 280자를 초과합니다.",
    failed: "전송 실패.",
    connection: "전송 실패. 연결을 확인하세요.",
    linkUnstable: "신호 링크 불안정.",
  },
};

// ─────────────────────────────────────────────
// SIGNAL
// ─────────────────────────────────────────────

export const signalKo = {
  description: [
    "TERMINAL 이벤트 신호 수신을 위한 채널을 등록합니다.",
    "신호는 등록된 이메일 또는 인스타그램 채널로 발신됩니다.",
  ],
  labelEmail: "이메일:",
  labelInstagram: "인스타그램 ID:",
  placeholderEmail: "이메일@주소.COM",
  consentLabel:
    "이메일·인스타그램 계정을 TERMINAL 이벤트 신호 발신 목적으로 수집합니다. 보존 기간: 채널 해지 시까지.",
  submitting: "▸ 채널 등록 중...",
  submitBtn: "▶ 채널 등록",
  committed: "✓ 채널 등록 완료",
  committedSub: "신호 발신 시 등록된 채널로 전송됩니다.",
  errors: {
    ALL_FIELDS_REQUIRED: "이메일과 인스타그램을 입력해주세요.",
    CONSENT_REQUIRED: "동의가 필요합니다.",
    INVALID_EMAIL_FORMAT: "이메일 형식이 올바르지 않습니다.",
    INVALID_INSTAGRAM_FORMAT: "인스타그램 형식이 올바르지 않습니다.",
    EMAIL_ALREADY_SUBSCRIBED: "이미 구독 중인 이메일입니다.",
    TRANSMISSION_FAILED: "전송 실패.",
    CONNECTION_ERROR: "전송 실패. 연결을 확인하세요.",
  },
};

// ─────────────────────────────────────────────
// LINK
// ─────────────────────────────────────────────

export const linkKo = {
  externalChannels: "▶ 외부 채널 — /terminal/link/",
  nodeCount: "3 노드",
  descriptions: {
    stannWeb: "공식 웹사이트 / 비주얼 아카이브",
    stannInsta: "소셜 채널 / 업데이트",
    terminalInsta: "이벤트 피드 / 신호 방송",
  },
};

// ─────────────────────────────────────────────
// 영문 번역 객체 (EN)
// ─────────────────────────────────────────────

/** 홈 DIRS 설명 — EN */
export const dirDescEn: Record<string, string> = {
  about: "PLATFORM MANIFESTO / SYSTEM INFORMATION",
  gate: "EVENT INFORMATION / COUNTDOWN / GUEST REQUEST",
  lineup: "ARTIST ROSTER / DOCK",
  status: "SYSTEM DIAGNOSTICS / NETWORK TELEMETRY",
  transmit: "VISITOR LOG",
  signal: "SIGNAL SUBSCRIPTION / MARKETING OPT-IN",
  link: "EXTERNAL CHANNELS / OFFICIAL LINKS",
};

/** About 페이지 MANIFESTO — EN */
export const manifestoEn: string[] = [
  "TERMINAL",
  "A Voyage to the Unknown Sector.",
  "",
  "TERMINAL is a",
  "Seoul-based platform.",
  "",
  "[ DEFINITION ]",
  "TERMINAL is not merely an event.",
  "",
  "It is a station where diverse senses",
  "and individuals converge,",
  "",
  "and the departure point for a collective voyage",
  "into the Unknown Sector.",
  "",
  "[ DESIGN PRINCIPLE ]",
  "We strip away unnecessary visual noise,",
  "filling the space with only essential light and sound.",
  "",
  "Like a CLI (Command Line Interface) system",
  "that accesses the core through text alone,",
  "",
  "we pursue a minimal environment",
  "that allows for deep immersion into the experience itself,",
  "rather than superficial decoration.",
  "",
  "[ OBJECTIVE ]",
  "TERMINAL is not a stage for one-sided observation.",
  "",
  "Every individual who steps inside",
  "becomes a vital entity that completes the space.",
  "",
  "Through this medium, we aim for a moment of",
  "absolute connection and resonance",
  "within an endless, massive flow.",
  "",
  "Terminal Architect : STANN LUMO",
];

export const commonEn = {
  signalUnstable: "⚠ SIGNAL LINK UNSTABLE",
  dbUnreachable: "DATABASE UNREACHABLE — RETRY LATER",
};

export const homeEn = {
  nextEntry: "NEXT LAUNCH —",
  rootDir: "▶ ROOT DIRECTORY — /terminal/",
  moduleCount: "6 MODULES",
};

export const gateEn = {
  tabUpcoming: "▶ UPCOMING",
  tabArchive: "◼ ARCHIVE",
  loading: "▸ LOADING GATE DATA...",
  requestBtn: "▶ GUEST REQUEST",
  archivedLabel: "◼ ARCHIVED",
  locationWarning:
    "⚠ DETAILED LOCATION AND GATE INFORMATION FOR SESSION ENTRY.",
  sessionArchived: (date: string) => `◼ SESSION ARCHIVED — ${date}`,
  eventInfoTitle: "EVENT_INFO.dec",
};

export const requestEn = {
  loading: "▸ LOADING REQUEST DATA...",
  periodInactive: "⚠ REQUEST PERIOD INACTIVE",
  windowInfo: (days: number) =>
    `NEXT RESPONSE WINDOW OPENS ${days} DAYS BEFORE EVENT`,
  eventDate: (date: string, time: string) => `EVENT DATE — ${date} · ${time}`,
  windowCountdown: (n: number) => `WINDOW OPENS IN T-${n} DAYS`,
  noEvent: "NO UPCOMING EVENT SCHEDULED. CHECK BACK LATER.",
  committed: "✓ REQUEST SUBMITTED",
  committedSub: "Thank you for joining the voyage.",
  invitationLines: [
    "YOU HAVE BEEN GRANTED ACCESS TO THIS CHANNEL.",
    "THIS INVITATION IS PERSONAL AND NON-TRANSFERABLE.",
    "TERMINAL IS A PRIVATE EVENT — ENTRY BY AUTHORIZATION ONLY.",
    "SUBMIT YOUR REQUEST BELOW TO BE CONSIDERED FOR ADMISSION.",
    "AN ACCESS CODE IS REQUIRED. IF YOU DO NOT HAVE ONE, CONTACT YOUR INVITER.",
  ],
  labelCode: "ACCESS CODE:",
  labelInvitedBy: "INVITED BY:",
  labelName: "NAME:",
  labelEmail: "EMAIL:",
  labelInstagram: "INSTAGRAM ID:",
  placeholderCode: "SESSION ACCESS CODE",
  placeholderInvitedBy: "INVITER NAME",
  placeholderName: "FULL NAME",
  placeholderEmail: "EMAIL@ADDRESS.COM",
  placeholderInstagram: "@USERNAME",
  privacyConsent:
    "Name, email, and Instagram ID will be collected for guest access management. Retention: 1 month after event. Not disclosed to third parties.",
  marketingConsent:
    "[OPTIONAL] Subscribe to receive future event signals via email or Instagram DM. Retention: until unsubscribed.",
  submitting: "▸ TRANSMITTING...",
  submitBtn: "▶ SUBMIT REQUEST",
  // invitedBy options
  invitedByOther: "OTHER",
  invitedByOtherPlaceholder: "ENTER INVITER NAME",
  // errors
  errors: {
    ALL_FIELDS_REQUIRED: "ALL FIELDS ARE REQUIRED.",
    PRIVACY_CONSENT_REQUIRED: "PRIVACY CONSENT IS REQUIRED.",
    INVALID_EMAIL_FORMAT: "INVALID EMAIL FORMAT.",
    INVALID_INPUT: "INVALID INPUT.",
    INVALID_INSTAGRAM_FORMAT: "INVALID INSTAGRAM FORMAT.",
    NO_UPCOMING_EVENT: "NO UPCOMING EVENT FOUND.",
    REQUEST_PERIOD_INACTIVE: "REQUEST PERIOD IS NOT ACTIVE.",
    INVALID_ACCESS_CODE: "INVALID ACCESS CODE.",
    GUEST_LIMIT_REACHED: "GUEST CAPACITY FOR THIS CODE HAS BEEN REACHED.",
    EMAIL_ALREADY_REGISTERED: "THIS EMAIL HAS ALREADY BEEN REGISTERED.",
    INTERNAL_SERVER_ERROR: "TRANSMISSION FAILED. RETRY LATER.",
    TRANSMISSION_FAILED: "TRANSMISSION FAILED.",
    CONNECTION_ERROR: "TRANSMISSION FAILED. CHECK CONNECTION.",
  },
};

export const lineupEn = {
  loading: "▸ LOADING LINEUP DATA...",
  upcomingTag: "UPCOMING",
  actCount: (n: number) => `${n} ARTISTS`,
  colArtist: "ARTIST",
  colTimeslot: "TIMESLOT",
  colStatus: "STATUS",
  footerUpcoming: "— ADDITIONAL LINEUP DECRYPTING — STANDBY —",
  footerArchived: "— SECTOR 01 COMPLETE — ANALOG DATA PURGED —",
  dock: (dock: string) => `DOCK ${dock}`,
};

export const statusEn = {
  labelSessionsRun: "SESSIONS RUN",
  labelNextLaunch: "NEXT LAUNCH",
  labelArtistNodes: "TOTAL ARTISTS",
  unitArchived: "SESSIONS",
  unitStandby: "STANDBY",
  unitConfirmed: "ARTISTS",
  sessionLogTitle: "SESSION_LOG.rec",
  colSession: "SESSION",
  colDate: "DATE",
  colArtists: "ARTISTS",
  colStatus: "STATUS",
  loading: "▸ LOADING SYSTEM DATA...",
  noSessions: "NO SESSIONS RECORDED.",
};

export const transmitEn = {
  labelAlias: "ALIAS:",
  labelMessage: "MESSAGE:",
  placeholderAlias: "ENTER ALIAS",
  placeholderMsg: "WRITE TO DATABASE...",
  committed: "✓ SIGNAL TRANSMITTED",
  submitting: "▸ TRANSMITTING...",
  submitBtn: "▶ TRANSMIT SIGNAL",
  syncing: "▸ SYNCING DATABASE...",
  noEntries: "NO ENTRIES.",
  logTitle: (n: number) => `SIGNAL LOG — ${n} ENTRIES`,
  logSyncing: "SIGNAL LOG — SYNCING...",
  prevBtn: "◀ PREV",
  nextBtn: "NEXT ▶",
  errors: {
    required: "ENTER ALIAS AND MESSAGE.",
    tooLong: "MESSAGE EXCEEDS 280 CHARACTERS.",
    failed: "TRANSMISSION FAILED.",
    connection: "TRANSMISSION FAILED. CHECK CONNECTION.",
    linkUnstable: "SIGNAL LINK UNSTABLE.",
  },
};

export const signalEn = {
  description: [
    "REGISTER YOUR RECEPTION CHANNEL FOR TERMINAL EVENT SIGNALS.",
    "SIGNALS WILL BE TRANSMITTED TO YOUR REGISTERED EMAIL OR INSTAGRAM CHANNEL.",
  ],
  labelEmail: "EMAIL:",
  labelInstagram: "INSTAGRAM ID:",
  placeholderEmail: "EMAIL@ADDRESS.COM",
  consentLabel:
    "Email and Instagram account will be collected for TERMINAL event signal transmission only. Retention: until channel is closed.",
  submitting: "▸ REGISTERING CHANNEL...",
  submitBtn: "▶ REGISTER CHANNEL",
  committed: "✓ CHANNEL REGISTERED",
  committedSub: "SIGNAL WILL BE ROUTED TO YOUR CHANNEL ON NEXT TRANSMISSION.",
  errors: {
    ALL_FIELDS_REQUIRED: "EMAIL AND INSTAGRAM ARE REQUIRED.",
    CONSENT_REQUIRED: "CONSENT IS REQUIRED.",
    INVALID_EMAIL_FORMAT: "INVALID EMAIL FORMAT.",
    INVALID_INSTAGRAM_FORMAT: "INVALID INSTAGRAM FORMAT.",
    EMAIL_ALREADY_SUBSCRIBED: "THIS EMAIL IS ALREADY SUBSCRIBED.",
    TRANSMISSION_FAILED: "TRANSMISSION FAILED.",
    CONNECTION_ERROR: "TRANSMISSION FAILED. CHECK CONNECTION.",
  },
};

export const linkEn = {
  externalChannels: "▶ EXTERNAL CHANNELS — /terminal/link/",
  nodeCount: "3 NODES",
  descriptions: {
    stannWeb: "OFFICIAL WEBSITE / VISUAL ARCHIVE",
    stannInsta: "SOCIAL CHANNEL / UPDATES",
    terminalInsta: "EVENT FEED / SIGNAL BROADCAST",
  },
};

// ─────────────────────────────────────────────
// 통합 i18n 객체
// ─────────────────────────────────────────────

export const i18n = {
  ko: {
    dirDesc: dirDescKo,
    manifesto: manifestoKo,
    common: commonKo,
    home: homeKo,
    gate: gateKo,
    request: requestKo,
    lineup: lineupKo,
    status: statusKo,
    transmit: transmitKo,
    signal: signalKo,
    link: linkKo,
  },
  en: {
    dirDesc: dirDescEn,
    manifesto: manifestoEn,
    common: commonEn,
    home: homeEn,
    gate: gateEn,
    request: requestEn,
    lineup: lineupEn,
    status: statusEn,
    transmit: transmitEn,
    signal: signalEn,
    link: linkEn,
  },
} as const;

export type I18nLang = keyof typeof i18n;
export type Translations = (typeof i18n)["ko"];
