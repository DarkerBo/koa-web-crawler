// 统计虾皮电商网

const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');
const puppeteer = require('puppeteer');

const app = new Koa();
const router = new Router();

// 自动滚动页面到底部
const autoScrollBottom = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      // 滚动的总高度
      let totalHeight = 0;
      // 每次滚动的距离
      const distance = 100;
      // 滚动的定时器
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

router.get('/', async (ctx) => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  // 创建新页面和访问指定地址
  const page = await browser.newPage();
  await page.goto('https://shopee.tw/%E4%B8%AD%E5%9C%8B%E6%98%9F%E5%B7%B4%E5%85%8B%E7%92%B0%E4%BF%9D%E5%AD%A32021%E6%9C%AA%E4%BE%86-%E5%AE%87%E5%AE%99-%E5%A4%AA%E7%A9%BA%E4%BA%BA-%E5%AE%87%E8%88%AA%E5%93%A1-%E5%A4%AA%E7%A9%BA%E5%B0%8F%E7%86%8A-%E5%AE%87%E8%88%AA-%E4%BF%9D%E6%BA%AB%E6%9D%AF-%E9%A6%AC%E5%85%8B%E6%9D%AF-i.15002216.9231816123/');

  // 让页面加载完成
  // await page.waitForTimeout(2000);

  // 页面滚动到底部，让评论DOM节点加载完成才能获取dom
  await autoScrollBottom(page);

  // await page.waitForSelector('.shopee-page-controller');


  // 评论分页
  // const COMMENT_PAGE_SELECTOR = '.container .product-ratings .shopee-product-comment-list .shopee-page-controller';
  // const COMMENT_PAGE_SELECTOR = '.container .product-ratings .shopee-product-comment-list .shopee-page-controller';
  // const COMMENT_PAGE_SELECTOR = '.container .product-ratings .shopee-product-comment-list .shopee-page-controller';
  const COMMENT_PAGE_SELECTOR = '.container .product-ratings .product-ratings__list .shopee-product-comment-list';

  // const pageNumTotal = await page.evaluate(sel => {
  //   // const btnList = Array.from($(sel).find('button'));
  //   const btnList = Array.from($(sel).childNodes);
  //   return btnList[btnList.length - 2].innerText;
  // }, COMMENT_PAGE_SELECTOR)

  await page.waitForSelector(COMMENT_PAGE_SELECTOR);

  // 评论列表信息
  // const COMMENT_INFO_SELECTOR = '.container .product-ratings .shopee-product-comment-list';

  console.log(await page.$(COMMENT_PAGE_SELECTOR));
  // console.log(await page.content(COMMENT_PAGE_SELECTOR));

  // await browser.close();


  // browser.close();

  // ctx.body = pageNumTotal;
  ctx.body = 'aaa';
})

app.use(router.routes());

app.listen(3000, () => {
  console.log('the server is start at port 3000');
});