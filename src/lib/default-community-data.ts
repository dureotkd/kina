import type { CommunityData } from "./community-types";

export const defaultCommunityData: CommunityData = {
  sales: [
    {
      id: "sale-triniel",
      characterName: "빠른거래",
      server: "트리니엘",
      amount: "3,000만 키나",
      price: "2,950원",
      kakaoUrl: "",
      createdAt: "2026-07-28T08:30:00.000Z",
      views: 24,
    },
    {
      id: "sale-siel",
      characterName: "시엘상점",
      server: "시엘",
      amount: "5,000만 키나",
      price: "3,000원",
      kakaoUrl: "",
      createdAt: "2026-07-27T12:10:00.000Z",
      views: 18,
    },
    {
      id: "sale-munin",
      characterName: "안전거래",
      server: "무닌",
      amount: "2,000만 키나",
      price: "2,900원",
      kakaoUrl: "",
      createdAt: "2026-07-26T04:40:00.000Z",
      views: 31,
    },
  ],
  buses: [
    {
      id: "bus-leveling",
      title: "주말 1~45 레벨업 육성 모집",
      author: "레벨업기사",
      server: "전 서버",
      content:
        "주말 오전과 저녁 시간대에 진행합니다. 현재 레벨과 목표 구간을 알려주시면 예상 시간과 비용을 안내해드립니다.",
      kakaoUrl: "",
      createdAt: "2026-07-28T06:20:00.000Z",
      views: 42,
    },
    {
      id: "bus-dungeon",
      title: "봉인던전·주둔지 묶음 진행",
      author: "던전기사",
      server: "아스펠",
      content:
        "봉인던전과 주둔지를 묶어서 진행합니다. 캐릭터 상태에 따라 일정이 달라질 수 있으니 상담 후 예약해주세요.",
      kakaoUrl: "",
      createdAt: "2026-07-27T09:15:00.000Z",
      views: 36,
    },
    {
      id: "bus-pet",
      title: "펫 도감과 내실 작업 상담",
      author: "내실전문",
      server: "모든 서버",
      content:
        "원하는 도감 구간과 보유 펫을 확인한 뒤 작업 범위를 정합니다. 진행 전 계정 보안 안내를 먼저 확인해주세요.",
      kakaoUrl: "",
      createdAt: "2026-07-25T14:00:00.000Z",
      views: 27,
    },
  ],
  community: [
    {
      id: "community-market",
      title: "오늘 서버별 시세 차이가 꽤 있네요",
      author: "키나생활",
      content:
        "월드 거래소와 일반 거래소 가격 차이가 커서 거래 전에 두 곳을 모두 확인하는 게 좋겠습니다. 체결가는 계속 바뀌니 참고용으로만 보세요.",
      createdAt: "2026-07-28T07:45:00.000Z",
      views: 56,
      comments: [
        {
          id: "comment-market-1",
          author: "시엘유저",
          content: "시엘도 오전보다 오후 가격이 조금 내려갔습니다.",
          createdAt: "2026-07-28T08:10:00.000Z",
        },
      ],
    },
    {
      id: "community-dungeon",
      title: "초보가 챙기면 좋은 일일 던전 순서",
      author: "루미엘초보",
      content:
        "시간이 부족한 날에는 보상 효율이 좋은 던전부터 처리하고, 남는 시간에 반복 콘텐츠를 진행하는 편이 수월했습니다.",
      createdAt: "2026-07-27T05:30:00.000Z",
      views: 81,
      comments: [],
    },
    {
      id: "community-question",
      title: "무닌 서버 거래 시간대 추천 부탁드립니다",
      author: "무닌정착",
      content:
        "저녁 시간에 거래량이 많은지 궁금합니다. 직접 거래해보신 분들의 경험을 알려주세요.",
      createdAt: "2026-07-26T11:05:00.000Z",
      views: 34,
      comments: [],
    },
  ],
  announcements: [
    {
      id: "notice-safety",
      title: "거래 전 반드시 확인해주세요",
      content:
        "입금자와 게임 내 수령자가 다르거나 제3자가 거래에 개입하는 경우 즉시 거래를 중단해주세요. 모든 상담은 등록된 카카오톡 채널에서만 진행합니다.",
      important: true,
      createdAt: "2026-07-28T00:00:00.000Z",
      views: 128,
    },
    {
      id: "notice-checklist",
      title: "사기 예방 체크리스트",
      content:
        "상대방 캐릭터명과 서버를 확인하고, 거래 대화와 입금 내역을 보관하세요. 지나치게 낮은 가격이나 대리 입금 요청은 특히 주의해야 합니다.",
      important: false,
      createdAt: "2026-07-25T00:00:00.000Z",
      views: 94,
    },
    {
      id: "notice-board",
      title: "게시판 이용 안내",
      content:
        "허위 판매글, 개인정보 노출, 비방성 게시글은 관리자 판단에 따라 삭제될 수 있습니다.",
      important: false,
      createdAt: "2026-07-20T00:00:00.000Z",
      views: 61,
    },
  ],
  scammers: [
    {
      id: "scammer-sample-1",
      title: "거래 중 제3자 입금을 요청한 사례",
      scammerName: "주의계정01",
      server: "전 서버",
      reporter: "제보자A",
      content:
        "대화 중 다른 사람 명의로 입금하겠다고 요청했습니다. 거래를 중단하고 관련 대화 내용을 보관했습니다.",
      createdAt: "2026-07-27T03:20:00.000Z",
      views: 73,
    },
    {
      id: "scammer-sample-2",
      title: "입금 후 연락이 끊긴 판매자",
      scammerName: "주의계정02",
      server: "시엘",
      reporter: "제보자B",
      content:
        "입금 확인 직후 연락이 끊겼습니다. 동일한 닉네임과 계좌를 사용하는 거래에 주의해주세요.",
      createdAt: "2026-07-24T10:50:00.000Z",
      views: 102,
    },
  ],
};
