import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shops } from "./shops";
import { Menus } from "./menus";

Meteor.publish("shops.all", function () {
  // If logged in, show only my shops.
  // If guest (not logged in), show only public shops (where userId is not set).
  const query = this.userId ? { userId: this.userId } : { userId: { $exists: false } };
  
  return Shops.find(query, { sort: { updatedAt: -1 } });
});

Meteor.publish("menus.byShop", async function (shopId) {
  check(shopId, String);
  
  // Verify access right to the shop before publishing menus
  const shop = await Shops.findOneAsync({ _id: shopId });
  if (!shop) return this.ready();

  // If private shop, user must be the owner
  if (shop.userId && shop.userId !== this.userId) {
    return this.ready();
  }
  
  return Menus.find({ shopId }, { sort: { createdAt: -1 } }); 
});
