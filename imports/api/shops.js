import { Mongo } from "meteor/mongo";

export const Shops = new Mongo.Collection("shops");
/**
 * Shops document shape:
 * { _id, name, createdAt }
 */
