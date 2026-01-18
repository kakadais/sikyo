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

/**
 * Checks if the current user can edit the shop.
 * @param {string} shopId
 * @param {string|null} userId
 * @returns {Promise<Object>} The shop document
 */
async function checkShopOwnership(shopId, userId) {
  const shop = await Shops.findOneAsync({ _id: shopId });
  if (!shop) throw new Meteor.Error("not-found", "Shop not found");

  // Private shop: must match owner
  if (shop.userId) {
    if (shop.userId !== userId) {
      throw new Meteor.Error("not-authorized", "You do not own this shop");
    }
  } 
  // Public shop: anyone can edit (Guest mode)
  
  return shop;
}

Meteor.methods({
  async "shops.insert"(name) {
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    const doc = {
      name: n,
      createdAt: now,
      updatedAt: now,
    };
    
    // Logged in user -> Private shop
    if (this.userId) {
      doc.userId = this.userId;
    }

    return await Shops.insertAsync(doc);
  },

  async "shops.updateName"(shopId, name) {
    check(shopId, String);
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    await checkShopOwnership(shopId, this.userId);

    const updated = await Shops.updateAsync(
      { _id: shopId },
      { $set: { name: n, updatedAt: now } }
    );
    return true;
  },

  async "shops.remove"(shopId) {
    check(shopId, String);

    await checkShopOwnership(shopId, this.userId);

    await Menus.removeAsync({ shopId });

    await Shops.removeAsync({ _id: shopId });
    return true;
  },

  async "menus.insert"(shopId, name) {
    check(shopId, String);
    check(name, String);
    const n = cleanName(name);
    const now = new Date();

    const shop = await checkShopOwnership(shopId, this.userId);

    const menuId = await Menus.insertAsync({
      shopId,
      name: n,
      count: 0,
      createdAt: now,
      updatedAt: now,
      // Menus don't strictly need userId if they are child of shop, 
      // but adding it doesn't hurt for consistency or direct queries.
      // However, we rely on Shop ownership.
      userId: shop.userId, 
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
    
    // Check shop ownership via parent
    await checkShopOwnership(menu.shopId, this.userId);

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

    await checkShopOwnership(menu.shopId, this.userId);

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

    await checkShopOwnership(menu.shopId, this.userId);

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

    await checkShopOwnership(shopId, this.userId);

    await Menus.updateAsync(
      { shopId },
      { $set: { count: 0, updatedAt: now } },
      { multi: true }
    );

    await Shops.updateAsync({ _id: shopId }, { $set: { updatedAt: now } });
    return true;
  },
});
