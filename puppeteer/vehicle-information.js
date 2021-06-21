// 获取二手车售价信息

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

    // 开启headless模式, 不会打开浏览器
    headless: true,
  });

  // 创建新页面和访问指定地址
  const page = await browser.newPage();
  await page.goto('https://www.guazi.com/hz/buy/');

  // 获取页面标题
  const title = await page.title();
  console.log(title);
 
  // 获取汽车品牌
  const BRANDS_INFO_SELECTOR = '.dd-all.clearfix.js-brand.js-option-hid-info';
  const brands = await page.evaluate(sel => {
    const ulList = Array.from($(sel).find('ul li p a'));
    const ctn = ulList.map(v => {
      return v.innerText.replace(/\s/g, '');
    });
    return ctn;
  }, BRANDS_INFO_SELECTOR);

  console.log('汽车品牌: ', JSON.stringify(brands));

  // 写入文件
  // let writerStream = fs.createWriteStream('car_brands.json');
  // writerStream.write(JSON.stringify(brands, undefined, 2), 'UTF8');
  // writerStream.end();

  // 获取车源列表
  const CAR_LIST_SELECTOR = 'ul.carlist';
  const carList = await page.evaluate((sel) => {
    const catBoxs = Array.from($(sel).find('li a'));
    const ctn = catBoxs.map(v => {
      const title = $(v).find('h2.t').text();
      const subTitle = $(v).find('div.t-i').text().split('|');
      return {
        title: title,
        year: subTitle[0],
        milemeter: subTitle[1]
      };
    });
    return ctn;
  }, CAR_LIST_SELECTOR);

  console.log(`总共${carList.length}辆汽车数据: `, JSON.stringify(carList, undefined, 2));

  // 将车辆信息写入文件
  // writerStream = fs.createWriteStream('car_info_list.json');
  // writerStream.write(JSON.stringify(carList, undefined, 2), 'UTF8');
  // writerStream.end();

  browser.close();

  ctx.body = 'Hello World';
})

app.use(router.routes());

app.listen(3000, () => {
  console.log('the server is start at port 3000');
});