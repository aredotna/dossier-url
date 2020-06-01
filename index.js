const metascraper = require("metascraper")([
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-publisher")(),
  require("metascraper-title")(),
  require("metascraper-url")(),
  require("metascraper-readerable")(),
  require("metascraper-fulltext")(),
]);

const got = require("got");

const validateParams = (params, headers) => {
  if (!headers || headers["x-auth-token"] !== process.env.DOSSIER_TOKEN) {
    return false;
  }

  return params && params.url;
};

const urlMissingError = {
  statusCode: 403,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({
    error:
      "You must pass a url as a parameter (i.e. ?url=https://are.na) and your token in the X-AUTH-TOKEN header",
  }),
};

module.exports.getURLMetadata = async (event) => {
  console.log("➡️ GET URL METATDATA", event);
  const { queryStringParameters: params } = event;

  if (!validateParams(params)) {
    return urlMissingError;
  }

  const { body: html, url } = await got(decodeURIComponent(params.url));

  console.log("got", { html, url });

  const metadata = await metascraper({ html, url });

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      url,
      metadata,
    }),
  };

  return response;
};
