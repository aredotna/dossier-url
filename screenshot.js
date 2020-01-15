const chromium = require("chrome-aws-lambda");
const browserless = require("browserless");

const urlMissingError = {
  statusCode: 403,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify({
    error: "You must pass a url as a parameter (i.e. ?url=https://are.na)"
  })
};

module.exports.getURLMetadata = async () => {
  const { queryStringParameters: params } = event;

  if (!validateParams(params)) {
    return urlMissingError;
  }

  let browser = null;

  try {
    let executablePath = await chromium.executablePath;

    const browser = browserless({
      ignoreHTTPSErrors: true,
      executablePath,
      args: [
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--no-sandbox",
        "--hide-scrollbars"
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 1280 });
    await page.goto(page, { url: params.url, viewport });

    const screenshot = await page.screenshot({
      fullPage: params.full || false
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png"
      },
      body: screenshot,
      isBase64Encoded: true
    };
  } catch (error) {
    console.error(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
