# Tiki
Ticketing System with test BOT

## Deploy
```shell
git clone https://github.com/Luphia/Tiki
npm install
node .
```
```shell
node --max_new_space_size=4096 --max_executable_size=2048 --max_old_space_size=4096 .
```
```shell
pm2 start --node-args="--max_old_space_size=3072 --max_executable_size=2048" bin/Tiki.js
```
## BOT Server
```shell
node --max_new_space_size=4096 --max_executable_size=2048 --max_old_space_size=4096 bbot.js
use chrome open page http:// your BOT Server IP /openBOT.html
```
```shell
pm2 start --node-args="--max_new_space_size=4096 --max_executable_size=2048 --max_old_space_size=4096" bin/bbot.js
```

## Test
```shell
node ./bin/multi-test.js 1000
```
