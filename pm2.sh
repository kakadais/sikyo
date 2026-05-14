#!/usr/bin/env bash
export MONGO_OPLOG_URL=mongodb://admin:mStartup!24@localhost:27777/local?authSource=admin
export MONGO_URL=mongodb://admin:mStartup!24@localhost:27777/sikyo?authSource=admin
export ROOT_URL=https://sikyo.digix.kr
export PORT=5136

METEOR_NODE_PATH=$(meteor node -e "console.log(process.execPath);" 2>&1)
pm2 start .meteor/build/bundle/main.js --name "sikyo" --interpreter "$METEOR_NODE_PATH"

