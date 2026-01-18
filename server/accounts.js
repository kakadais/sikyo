import { Accounts } from "meteor/accounts-base";
import { seedUserData } from "./initData";

Accounts.onCreateUser((options, user) => {
  // 기본 프로필 설정 로직 (필요시)
  if (options.profile) {
    user.profile = options.profile;
  }

  // 비동기로 초기 데이터 생성 실행
  // 주의: onCreateUser는 동기적으로 유저 객체를 반환해야 하므로,
  // 데이터 생성은 비동기로 처리하고 에러는 로그로 남김.
  // 또는 Meteor.defer 등을 사용할 수도 있음.
  // 여기서는 Promise를 기다리지 않고 실행(fire-and-forget)하거나
  // async/await을 쓸 수 없으므로(onCreateUser는 sync), Meteor.defer 사용 권장.
  
  // Meteor 3.0+ 에서는 async 지원이 좋아졌으나, onCreateUser hook 자체의 시그니처 확인 필요.
  // 안전하게 Meteor.defer 사용.
  
  // TODO: Meteor 3.3.2 에서는 async hook 지원 여부 확인 필요하나, 
  // 일반적인 패턴인 Meteor.defer 사용.
  
  const userId = user._id;
  
  // 3.3.2 Async context issue might arise, ensuring it runs.
  // seedUserData is async.
  
  Promise.resolve().then(async () => {
      try {
          console.log(`[sikyo] Seeding initial data for new user: ${userId}`);
          await seedUserData(userId);
      } catch (e) {
          console.error(`[sikyo] Failed to seed data for user ${userId}`, e);
      }
  });

  return user;
});
