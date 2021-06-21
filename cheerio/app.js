// 获取百度新闻的热门新闻信息

const Koa = require('koa');
const Router = require('koa-router');
const axios = require('axios');
const cheerio = require('cheerio');

const app = new Koa();

const router = new Router();

app.use(router.routes());

const getHotNews = (res) => {
  const hotNews = [];
  /* 
    使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
    以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
  */
  const $ = cheerio.load(res);

  // 找到目标数据所在的页面元素，获取数据
  $('div#pane-news ul li a').each((idx, ele) => {
    // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
    // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
    const news = {
      title: $(ele).text(),        // 获取新闻标题
      href: $(ele).attr('href')    // 获取新闻网页链接
    };
    hotNews.push(news)              // 存入最终结果数组
  });
  return hotNews;
}
router.get('/', async (ctx) => {
  const res = await axios({
    method: 'GET',
    url: 'http://news.baidu.com',
  })

  // 抓取新闻热点
  const hotNews = getHotNews(res.data);
  ctx.body = hotNews;
})

app.listen(3000, () => {
  console.log('the server is start at port 3000');
});