const metascraper = require("metascraper")([
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-publisher")(),
  require("metascraper-title")(),
  require("metascraper-url")()
]);

const got = require("got");

const targetUrl =
  "https://www.nytimes.com/2020/01/13/business/economy/iran-economy.html";

(async () => {
  const { body: html, url } = await got(targetUrl);
  const metadata = await metascraper({ html, url });
  console.log(metadata);
})();
