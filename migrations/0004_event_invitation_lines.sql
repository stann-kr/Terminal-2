-- Update TRM-02 with invitationLines in JSON data
UPDATE events
SET
    data = json_set(
        data,
        '$.invitationLines',
        json (
            '{
  "en": [
    "GREETINGS. THIS IS STANN LUMO.",
    "THIS IS THE SECOND OPERATION OF MY PLATFORM, TERMINAL.",
    "",
    "BEYOND THE INITIAL BOOT SEQUENCE, THE SYSTEM NOW ENTERS",
    "THE HELIOPAUSE OUTSKIRTS — THE ABYSS AT THE SOLAR SYSTEM''S EDGE.",
    "",
    "I LOOK FORWARD TO MEETING YOU AT THE JUNCTION WHERE",
    "PURE SIGNALS CROSS INTO UNCHARTED TERRITORY.",
    "",
    "[ NOTICE ]",
    "* GUESTS REGISTERED VIA THIS FORM ARE GRANTED FREE ENTRY",
    "  BEFORE 00:00 (MIDNIGHT) ON THE DAY OF THE EVENT.",
    "",
    "┌───────────────────────────────────┐",
    " TERMINAL [02] : HELIOPAUSE OUTSKIRTS",
    "└───────────────────────────────────┘",
    "▪ DATE : 26_05-08 (FRI)",
    "▪ LOCATION : FAUST, SEOUL"
  ],
  "ko": [
    "안녕하세요. STANN LUMO입니다.",
    "저의 플랫폼 TERMINAL의 두 번째 이벤트입니다.",
    "",
    "첫 번째 부트 시퀀스를 넘어, 시스템은 태양계 최외곽의",
    "심연인 HELIOPAUSE OUTSKIRTS로 진입합니다.",
    "",
    "순수한 신호와 미지의 구역이 교차하는 정거장에서 뵙겠습니다.",
    "",
    "[ NOTICE ]",
    "* 본 설문을 통해 등록하신 게스트는 이벤트 당일",
    "  00시(자정) 이전까지 무료 입장이 가능합니다.",
    "",
    "┌───────────────────────────────────┐",
    " TERMINAL [02] : HELIOPAUSE OUTSKIRTS",
    "└───────────────────────────────────┘",
    "▪ DATE : 26_05-08 (FRI)",
    "▪ LOCATION : FAUST, SEOUL"
  ]
}'
        )
    )
WHERE
    id = 'TRM-02';