import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shops } from "./shops";
import { Menus } from "./menus";

function cleanName(name) {
  const v = String(name || "").trim();
  if (!v) throw new Meteor.Error("invalid-name", "Name is required");
  if (v.length > 60) throw new Meteor.Error("invalid-name", "Name too long");
  return v;
}

Meteor.methods({
  async "shops.insert"(name) {
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    return await Shops.insertAsync({
      name: n,
      createdAt: now,
      updatedAt: now,
    });
  },

  async "shops.updateName"(shopId, name) {
    check(shopId, String);
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    const updated = await Shops.updateAsync(
      { _id: shopId },
      { $set: { name: n, updatedAt: now } }
    );
    if (!updated) throw new Meteor.Error("not-found", "Shop not found");
    return true;
  },

  async "shops.remove"(shopId) {
    check(shopId, String);

    await Menus.removeAsync({ shopId });

    const removed = await Shops.removeAsync({ _id: shopId });
    if (!removed) throw new Meteor.Error("not-found", "Shop not found");
    return true;
  },

  async "menus.insert"(shopId, name) {
    check(shopId, String);
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    const shop = await Shops.findOneAsync({ _id: shopId });
    if (!shop) throw new Meteor.Error("not-found", "Shop not found");

    const menuId = await Menus.insertAsync({
      shopId,
      name: n,
      count: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 메뉴 추가는 상위 Shop도 updatedAt 갱신(목록 정렬에 반영)
    await Shops.updateAsync({ _id: shopId }, { $set: { updatedAt: now } });

    return menuId;
  },

  async "menus.updateName"(menuId, name) {
    check(menuId, String);
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    const menu = await Menus.findOneAsync({ _id: menuId });
    if (!menu) throw new Meteor.Error("not-found", "Menu not found");

    const updated = await Menus.updateAsync(
      { _id: menuId },
      { $set: { name: n, updatedAt: now } }
    );
    if (!updated) throw new Meteor.Error("not-found", "Menu not found");

    // 상위 Shop도 갱신
    await Shops.updateAsync({ _id: menu.shopId }, { $set: { updatedAt: now } });

    return true;
  },

  async "menus.remove"(menuId) {
    check(menuId, String);

    const menu = await Menus.findOneAsync({ _id: menuId });
    if (!menu) throw new Meteor.Error("not-found", "Menu not found");

    const removed = await Menus.removeAsync({ _id: menuId });
    if (!removed) throw new Meteor.Error("not-found", "Menu not found");

    // 상위 Shop 갱신
    const now = new Date();
    await Shops.updateAsync({ _id: menu.shopId }, { $set: { updatedAt: now } });

    return true;
  },

  async "menus.incCount"(menuId, delta) {
    check(menuId, String);
    check(delta, Number);

    const d = Math.trunc(delta);
    if (d !== 1 && d !== -1) {
      throw new Meteor.Error("invalid", "delta must be 1 or -1");
    }

    const menu = await Menus.findOneAsync({ _id: menuId });
    if (!menu) throw new Meteor.Error("not-found", "Menu not found");

    const next = Math.max(0, Math.min(999, (menu.count || 0) + d));
    const now = new Date();

    await Menus.updateAsync(
      { _id: menuId },
      { $set: { count: next, updatedAt: now } }
    );

    // 상위 Shop도 갱신
    await Shops.updateAsync({ _id: menu.shopId }, { $set: { updatedAt: now } });

    return next;
  },

  async "menus.resetCountsByShop"(shopId) {
    check(shopId, String);
    const now = new Date();

    await Menus.updateAsync(
      { shopId },
      { $set: { count: 0, updatedAt: now } },
      { multi: true }
    );

    await Shops.updateAsync({ _id: shopId }, { $set: { updatedAt: now } });
    return true;
  },
});
