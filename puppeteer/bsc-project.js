// bsc链上新发的项目

const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');
const puppeteer = require('puppeteer');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  const browser = await puppeteer.launch({
    // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
    // executablePath: '/Users/bowen/Documents/project/test',

    // 关闭headless模式, 会打开浏览器
    headless: true,
  });

  // 创建新页面和访问指定地址
  const page = await browser.newPage();
  await page.goto('https://music.163.com/');

  


  browser.close();

  ctx.body = 'Hello World';
})

app.use(router.routes());

app.listen(3000, () => {
  console.log('the server is start at port 3000');
});