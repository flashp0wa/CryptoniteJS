const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

const url = 'https://cryptonews.com/news/imfs-defi-governance-recommendations-include-these-two-steps.htm';

const {data} = await axios.get(url);

const $ = cheerio.load(data);

console.log($.html());