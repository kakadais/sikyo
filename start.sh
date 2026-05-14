#!/usr/bin/env bash
export MONGO_OPLOG_URL=mongodb://admin:mStartup!24@localhost:27777/local?authSource=admin
export MONGO_URL=mongodb://admin:mStartup!24@localhost:27777/sikyo?authSource=admin
export ROOT_URL=http://sikyo.digix.kr
export PORT=5136
#export ROOT_URL=http://pr.codeasy.org
meteor -p5136

#nohup meteor node .meteor/build/bundle/main.js --codeasy=prlab &
#echo $NVM_DIR
#[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
#nvm use 12.18.4
#node .meteor/build/bundle/main.js --codeasy=prlab 
#meteor node .meteor/build/bundle/main.js --codeasy=prlab

#meteor --production --extra-packages bundle-visualizer
#METEOR_NODE_PATH=$(meteor node -e "console.log(process.execPath);" 2>&1)
#pm2 start .meteor/build/bundle/main.js --name "prlab" --interpreter "$METEOR_NODE_PATH"
