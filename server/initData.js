import { faker } from "@faker-js/faker";
import { Shops } from "/imports/api/shops";
import { Menus } from "/imports/api/menus";

const CAFE_SHOPS = [
  { name: "스타벅스", menus: ["아메리카노", "카페라떼", "바닐라라떼", "콜드브루", "카푸치노", "디카페인 아메리카노", "자몽허니블랙티", "초코라떼"] },
  { name: "이디야", menus: ["아메리카노", "카페라떼", "바닐라라떼", "연유라떼", "콜드브루", "복숭아 아이스티", "레몬에이드", "딸기라떼"] },
  { name: "투썸플레이스", menus: ["아메리카노", "카페라떼", "바닐라라떼", "콜드브루", "아이스티", "레몬에이드", "카페모카"] },
];

const LUNCH_SHOPS = [
  { name: "김밥천국", menus: ["야채김밥", "참치김밥", "라면", "떡라면", "돈까스", "제육덮밥", "김치볶음밥", "오므라이스", "우동"] },
  { name: "한솥", menus: ["치킨마요", "돈치마요", "제육볶음 도시락", "고기고기 도시락", "카레 도시락", "불고기 도시락", "스테이크 도시락"] },
  { name: "홍콩반점", menus: ["짜장면", "짬뽕", "볶음밥", "탕수육(소)", "탕수육(중)", "군만두", "고추짜장"] },
  { name: "역전우동", menus: ["우동", "어묵우동", "냉우동", "김치우동", "돈까스", "카레라이스", "튀김우동"] },
  { name: "본죽", menus: ["전복죽", "쇠고기야채죽", "호박죽", "삼계죽", "참치야채죽"] },
];

const FASTFOOD_SHOPS = [
  { name: "맥도날드", menus: ["빅맥", "맥스파이시 상하이 버거", "치즈버거", "더블치즈버거", "감자튀김", "코카콜라", "제로콜라"] },
  { name: "맘스터치", menus: ["싸이버거", "화이트갈릭버거", "치킨텐더", "감자튀김", "콜라", "치즈스틱"] },
  { name: "버거킹", menus: ["와퍼", "치즈와퍼", "불고기버거", "롱치킨버거", "감자튀김", "코카콜라", "어니언링"] },
  { name: "서브웨이", menus: ["이탈리안 B.M.T", "터키", "스테이크&치즈", "치킨 데리야끼", "에그마요", "쿠키", "콜라"] },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * 특정 유저(또는 게스트)를 위한 초기 데이터를 생성합니다.
 * @param {string|null} userId - 생성할 데이터의 소유자 ID. null이면 공개(게스트) 데이터.
 */
export async function seedUserData(userId = null) {
  const now = new Date();

  // 카테고리별로 적당히 섞어서 7~10개 정도 생성
  const pool = shuffle([
    ...CAFE_SHOPS.map((x) => ({ ...x, kind: "카페" })),
    ...LUNCH_SHOPS.map((x) => ({ ...x, kind: "점심" })),
    ...FASTFOOD_SHOPS.map((x) => ({ ...x, kind: "패스트푸드" })),
  ]);

  const targetCount = faker.number.int({ min: 7, max: 10 });
  const picked = pool.slice(0, targetCount);

  for (const shopSeed of picked) {
    const shopData = {
      name: shopSeed.name,
      kind: shopSeed.kind, 
      createdAt: now,
      updatedAt: now,
    };
    
    if (userId) {
      shopData.userId = userId;
    }

    const shopId = await Shops.insertAsync(shopData);

    // 메뉴는 3~10개 정도 (보유 메뉴 수에 따라 조정)
    const maxCount = Math.min(10, shopSeed.menus.length);
    const minCount = Math.min(3, maxCount);
    const count = faker.number.int({ min: minCount, max: maxCount });
    
    const menus = shuffle(shopSeed.menus).slice(0, count);

    for (const menuName of menus) {
        const menuData = {
            shopId,
            name: menuName,
            count: 0,
            createdAt: now,
            updatedAt: now,
        }
        if (userId) {
            menuData.userId = userId;
        }
      await Menus.insertAsync(menuData);
    }
  }
}

/**
 * 서버 시작 시 호출되는 초기화 함수.
 * userId가 주어지지 않으면 전체 초기화 후 게스트 데이터를 생성합니다.
 * @param {string|null} userId 
 */
export async function initData(userId = null) {
  // userId가 명시되면 해당 유저 데이터만 생성 (기존 데이터 삭제 X)
  if (userId) {
    console.log(`[sikyo] Seeding data for user: ${userId}`);
    await seedUserData(userId);
    return;
  }

  // userId가 없으면 전체 초기화 (기존 동작 유지)
  console.log(`[sikyo] Clearing all data and seeding guest data...`);
  await Menus.removeAsync({});
  await Shops.removeAsync({});

  await seedUserData(null); // 게스트 데이터 생성

  const shopRows = await Shops.find().countAsync();
  const menuRows = await Menus.find().countAsync();
  console.log(`[sikyo] initData done. shops=${shopRows} menus=${menuRows}`);
}
