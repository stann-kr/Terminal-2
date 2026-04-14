-- Update TRM-02 with invitationLines in JSON data
UPDATE events
SET data = json_set(data, '$.invitationLines', json('{
  "en": [
    "YOU HAVE BEEN GRANTED ACCESS TO THIS CHANNEL.",
    "THIS INVITATION IS PERSONAL AND NON-TRANSFERABLE.",
    "TERMINAL IS A PRIVATE EVENT — ENTRY BY AUTHORIZATION ONLY.",
    "SUBMIT YOUR REQUEST BELOW TO BE CONSIDERED FOR ADMISSION.",
    "AN ACCESS CODE IS REQUIRED. IF YOU DO NOT HAVE ONE,",
    "PLEASE CONTACT TERMINAL HUB FOR COORDINATES."
  ],
  "ko": [
    "이 채널에 대한 접근 권한이 부여되었습니다.",
    "이 초대는 개인적이며 양도 불가합니다.",
    "TERMINAL은 RSVP 기반 이벤트입니다 — 신청 절차를 완료해주세요.",
    "입장 심사를 위해 아래 양식을 작성해 제출하세요.",
    "인증 코드가 필요합니다. 없는 경우,",
    "접근 좌표 확인을 위해 터미널 허브로 문의 바랍니다."
  ]
}'))
WHERE id = 'TRM-02';
