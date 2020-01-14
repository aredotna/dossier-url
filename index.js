const metascraper = require("metascraper")([
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-publisher")(),
  require("metascraper-title")(),
  require("metascraper-url")(),
  require("metascraper-fulltext")()
]);

const got = require("got");

module.exports.getURLMetadata = async event => {
  const { queryStringParameters: params } = event;

  if (!params || !params.url) {
    return {
      statusCode: 403,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "You must pass a url as a parameter (i.e. ?url=https://are.na)"
      })
    };
  }

  const { body: html, url } = await got(decodeURIComponent(params.url));
  const metadata = await metascraper({ html, url });

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      url,
      metadata
    })
  };

  return response;
};
