if [ -f "./api.tar.gz" ];then
  rm -f api.tar.gz
fi
if [ -f "./web.tar.gz" ];then
  rm -f web.tar.gz
fi
cd ./web
npm run build
cd ../
tar -czvf web.tar.gz ./web/dist/*
ssh xg "rm -rf ~/tuangou/web"
scp ./web.tar.gz xg:~/tuangou/
ssh -t -t xg << reallssh
cd ~/tuangou
tar xzf web.tar.gz
exit
reallssh