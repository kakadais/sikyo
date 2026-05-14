#rm -rf .meteor/build/*
current=$(date +"%Y-%m-%d_%H-%M-%S")
mkdir -p .meteor/build
meteor build .meteor/build/$current
cd .meteor/build/$current
tar zxvf *.tar.gz
cd bundle/programs/server
meteor npm install --production
cd ../../../../
rm ./bundle
ln -sf $current/bundle ./bundle
