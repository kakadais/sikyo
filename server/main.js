import { Meteor } from "meteor/meteor";

import "/imports/api/publications";
import "/imports/api/methods";

import { initData } from "./initData";

Meteor.startup(async () => {
  if (!Meteor.isProduction) {
    // await initData();
  }
});
