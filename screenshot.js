const chromium = require("chrome-aws-lambda");
const browserless = require("browserless");

const validateParams = (params, headers) => {
  if (
    !headers ||
    !(
      headers["x-auth-token"] === process.env.DOSSIER_TOKEN ||
      headers["X-Auth-Token"] === process.env.DOSSIER_TOKEN ||
      headers["X-Auth-Token"][0] === process.env.DOSSIER_TOKEN
    )
  ) {
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
  console.log("🌹 event", event);
  const { queryStringParameters: params, headers } = event;

  if (!validateParams(params, headers)) {
    return urlMissingError;
  }
  let browser = null;
  let buffer = null;

  try {
    let executablePath = await chromium.executablePath;

    // Download fonts
    // These will be cached once they are downloaded once.
    await chromium.font(
      "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
    );
    await chromium.font(
      "https://s3.amazonaws.com/arena_assets/assets/fonts/Times+New+Roman.ttf"
    );
    await chromium.font(
      "https://s3.amazonaws.com/arena_assets/assets/fonts/Times+New+Roman+Bold.ttf"
    );
    await chromium.font(
      "https://s3.amazonaws.com/arena_assets/assets/fonts/Arial.ttf"
    );
    await chromium.font(
      "https://s3.amazonaws.com/arena_assets/assets/fonts/Arial+Bold.ttf"
    );

    browser = await browserless({
      ignoreHTTPSErrors: true,
      timeout: 120000,
      executablePath,
      args: [
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--no-sandbox",
        "--hide-scrollbars",
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
      ]
    });

    console.log("🎆 getting screenshot");
    buffer = await browser.screenshot(params.url, {
      waitUntil: "networkidle2",
      viewport: {
        width: 1280,
        height: 1280
      }
    });
  } catch (error) {
    console.log("🚨 Caught error", error);
    return error;
  } finally {
    if (browser) {
      await browser.close();
    }
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
