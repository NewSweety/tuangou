if [ -f "./api.tar.gz" ];then
  rm -f api.tar.gz
fi
if [ -f "./web.tar.gz" ];then
  rm -f web.tar.gz
fi
cd ./web
npm run build
cd ../
tar -czvf api.tar.gz ./api/*
tar -czvf web.tar.gz ./web/dist/*
ssh xg "rm -rf ~/tuangou/*"
scp ./api.tar.gz xg:~/tuangou/
scp ./web.tar.gz xg:~/tuangou/
ssh -t -t xg << reallssh
cd ~/tuangou
tar xzf api.tar.gz
tar xzf web.tar.gz
pm2 restart all
exit
reallssh