// 统计虾皮电商网某商品所有评论的购买商品种类及数量

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


  // 评论分页选择器
  const COMMENT_PAGE_SELECTOR = '.container .product-ratings .product-ratings__list .shopee-page-controller';
  // 等待节点加载完成才进行下一步
  await page.waitForSelector(COMMENT_PAGE_SELECTOR);


  // 分页下一页按钮选择器
  const COMMENT_PAGE_NEXT_BTN = '.container .product-ratings .product-ratings__list .shopee-page-controller .shopee-icon-button--right';


  // 评论内容选择器
  const COMMENT_LIST_SELECTOR = '.container .product-ratings .product-ratings__list .shopee-product-comment-list';
  // 等待节点加载完成才进行下一步
  await page.waitForSelector(COMMENT_LIST_SELECTOR);

  // 当前选择的分页按钮选择器
  const COMMENT_SELECT_PAGE = '.container .product-ratings .product-ratings__list .shopee-page-controller .shopee-button-solid';

  // 当前选择的分页页码
  let selectPageNum = await page.evaluate(sel => {
    return $(sel).text();
  }, COMMENT_SELECT_PAGE);

  // 获取评论所有商品的名称
  const goodsAllData = [];

  while (true) {
    // 获取评论购买的商品信息
    const goodsData = await page.evaluate(sel => {
      const goodsList = Array.from($(sel).find('.shopee-product-rating .shopee-product-rating__variation'));

      // eg: 規格: 未來小熊細口保溫杯430ml 【只需要获取后面商品名称】
      return goodsList.map(v => v.innerText.slice(4));
    }, COMMENT_LIST_SELECTOR);

    goodsAllData.push(...goodsData);

    // 点击下一页
    await (await page.$(COMMENT_PAGE_NEXT_BTN)).click();

    // 等待页面更新dom
    await page.waitForTimeout(1000);

    // 更新选择的分页
    const newPageNum = await page.evaluate(sel => {
      // 按钮的文本需要通过text()获取,而不能用innerText
      return $(sel).text();
    }, COMMENT_SELECT_PAGE);

    if (newPageNum === selectPageNum) break;
    // 如果不相同，更新当前最新页面
    selectPageNum = newPageNum;
  }

  const goodsInfo = {};
  for (const item of goodsAllData) {
    goodsInfo[item] = goodsInfo[item] ? goodsInfo[item] + 1 : 1;
  }

  browser.close();

  ctx.body = goodsInfo;
})

app.use(router.routes());

app.listen(3000, () => {
  console.log('the server is start at port 3000');
});