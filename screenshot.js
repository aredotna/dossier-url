const chromium = require("chrome-aws-lambda");
const browserless = require("browserless");

const validateParams = (params, headers) => {
  if (!headers || headers["x-auth-token"] !== process.env.DOSSIER_TOKEN) {
    return false;
  }

  return params && params.url;
};

const urlMissingError = {
  statusCode: 403,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify({
    error:
      "You must pass a url as a parameter (i.e. ?url=https://are.na) and your token in the X-AUTH-TOKEN header"
  })
};

module.exports.getURLScreenshot = async event => {
  const { queryStringParameters: params, headers } = event;
  console.log("event", event);

  if (!validateParams(params, headers)) {
    return urlMissingError;
  }
  let browser = null;
  let buffer = null;

  try {
    let executablePath = await chromium.executablePath;

    browser = await browserless({
      ignoreHTTPSErrors: true,
      timeout: 120000,
      executablePath,
      args: [
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--no-sandbox",
        "--hide-scrollbars"
      ]
    });

    console.log("🎆 getting screenshot");
    buffer = await browser.screenshot(params.url, {
      waitFor: 200,
      viewport: {
        width: 1280,
        height: 1280
      }
    });
  } catch (error) {
    console.log("ERRORRRRRR", error);
    return error;
  } finally {
    await browser.close();
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "image/png"
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true
  };

  return response;
};
