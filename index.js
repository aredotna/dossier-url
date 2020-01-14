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

const metascraperReaderable = require("metascraper")([
  require("metascraper-readerable")()
]);

const got = require("got");

const validateParams = params => {
  return params && params.url;
};

const urlMissingError = {
  statusCode: 403,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify({
    error: "You must pass a url as a parameter (i.e. ?url=https://are.na)"
  })
};

module.exports.getURLMetadata = async event => {
  const { queryStringParameters: params } = event;

  if (!validateParams(params)) {
    return urlMissingError;
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

module.exports.getURLReaderable = async event => {
  const { queryStringParameters: params } = event;

  if (!validateParams(params)) {
    return urlMissingError;
  }

  const { body: html, url } = await got(decodeURIComponent(params.url));
  const metadata = await metascraperReaderable({ html, url });

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
