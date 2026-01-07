import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shops } from "./shops";
import { Menus } from "./menus";

Meteor.publish("shops.all", function () {
  return Shops.find({}, { sort: { updatedAt: -1 } });
});

Meteor.publish("menus.byShop", function (shopId) {
  check(shopId, String);
  return Menus.find({ shopId }, { sort: { createdAt: -1 } }); // updatedAt -> createdAt
});
