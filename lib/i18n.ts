/** 홈 DIRS 설명 — KO */
export const dirDescKo: Record<string, string> = {
  about: "플랫폼 매니페스토 / 시스템 정보",
  gate: "다음 입장 / 카운트다운 / 입장 신청",
  lineup: "아티스트 라인업 / 도크",
  status: "시스템 진단 / 네트워크 텔레메트리",
  transmit: "방문자 로그 / 노드 동기화",
  link: "외부 채널 / 공식 링크",
};

/** About 페이지 MANIFESTO — KO */
export const manifestoKo: string[] = [
  "TERMINAL은 오디오 신호와 데이터가 교차하는 무기질적인 정거장을 설계하는",
  "서울 기반의 테크노 플랫폼입니다.",
  "",
  "[ DESIGN PRINCIPLE ]",
  "불필요한 시각적 장식을 덜어내고, 정교하게 통제된 환경을 구축하는 데 집중합니다.",
  "오직 텍스트와 필수적인 빛으로만 공간을 렌더링하는",
  "CLI(Command Line Interface) 시스템처럼, 가장 본질적이고 미니멀한 형태를 지향합니다.",
  "",
  "[ AUDIO ENGINE ]",
  "초기 미래주의(Early Futurism)의 원초적 질감을 담은",
  "최면적이고 미래지향적인(Hypnotic & Futuristic) 테크노.",
  "",
  "[ OBJECTIVE ]",
  "TERMINAL은 단순한 관람객을 위한 무대를 구축하지 않습니다.",
  "이곳에 접속한 모든 객체가 개별 노드(Node)로서 시스템 연산에 참여하고,",
  "미지의 궤도를 함께 탐색하는 완전한 동기화를 목표로 합니다.",
  "",
  "터미널 아키텍트 : STANN LUMO",
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
  nextEntry: "다음 입장 —",
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
  requestBtn: "▶ 입장 신청",
  archivedLabel: "◼ 아카이브됨",
  locationWarning: "⚠ 정확한 장소는 승인된 인원에게만 공개됩니다.",
  /** `◼ 세션 종료 — ${date}` */
  sessionArchived: (date: string) => `◼ 세션 종료 — ${date}`,
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
  committed: "✓ 신청 완료 — 확인 대기 중",
  committedSub: "신청이 접수되었습니다. 추가 안내가 이어질 예정입니다.",
  invitationLines: [
    "이 채널에 대한 접근 권한이 부여되었습니다.",
    "이 초대는 개인적이며 양도 불가합니다.",
    "TERMINAL은 비공개 이벤트입니다 — 승인된 인원만 입장 가능합니다.",
    "입장 심사를 위해 아래 양식을 작성해 제출하세요.",
    "인증 코드가 필요합니다. 없는 경우,",
    "초대인에게 현재 세션 코드를 문의하세요.",
  ],
  // 폼 레이블
  labelName: "이름:",
  labelEmail: "이메일:",
  labelInstagram: "인스타그램 ID:",
  labelInvitedBy: "초대인:",
  labelCode: "인증 코드:",
  // 플레이스홀더
  placeholderName: "전체 이름",
  placeholderEmail: "이메일@주소.COM",
  placeholderInstagram: "@사용자명",
  placeholderInvitedBy: "초대한 분의 이름",
  placeholderCode: "세션 인증 코드",
  // 개인정보 동의
  privacyConsent:
    "이벤트 게스트 관리 목적으로 개인정보(이름, 이메일, 인스타그램 ID)의 수집 및 이용에 동의합니다. 제3자에게 공유되지 않습니다.",
  // 버튼
  submitting: "▸ 전송 중...",
  submitBtn: "▶ 신청 제출",
  // 에러
  errors: {
    ALL_FIELDS_REQUIRED: "모든 항목을 입력해주세요.",
    PRIVACY_CONSENT_REQUIRED: "개인정보 동의가 필요합니다.",
    INVALID_EMAIL_FORMAT: "이메일 형식이 올바르지 않습니다.",
    NO_UPCOMING_EVENT: "예정된 이벤트가 없습니다.",
    REQUEST_PERIOD_INACTIVE: "신청 기간이 아닙니다.",
    INVALID_ACCESS_CODE: "유효하지 않은 인증 코드입니다.",
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
  labelActiveRelays: "활성 릴레이",
  labelSignalUptime: "신호 가동률",
  labelCoreFreq: "코어 주파수",
  unitNodes: "노드",
  /** `부하: ${n}%` */
  load: (n: number) => `부하: ${n}%`,
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
