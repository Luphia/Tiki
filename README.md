# Tiki
Ticketing System with test BOT

## Deploy
```shell
git clone https://github.com/Luphia/Tiki
npm install
node .
```

## Test
```shell
node ./bin/multi-test.js 1000
node --max_new_space_size=4096 --max_executable_size=2048 --max_old_space_size=4096 .
```
