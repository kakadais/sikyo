import { Mongo } from "meteor/mongo";

export const Menus = new Mongo.Collection("menus");
/**
 * Menus document shape:
 * { _id, shopId, name, createdAt }
 */
