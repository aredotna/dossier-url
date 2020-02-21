const chromium = require("chrome-aws-lambda");
const browserless = require("browserless");
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const s3 = new AWS.S3();

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

module.exports.getURLScreenshot = async event => {
  const { queryStringParameters: params } = event;

  if (!validateParams(params)) {
    return urlMissingError;
  }

  let location = null;

  try {
    let executablePath = await chromium.executablePath;

    const browser = await browserless({
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
    const buffer = await browser.screenshot(params.url, {
      waitFor: 200,
      viewport: {
        width: 1280,
        height: 1280
      }
    });

    console.log("⛩ Uploading to S3");
    const response = await s3
      .upload({
        Bucket: process.env.BUCKET,
        Key: `screenshot-${new Date().getTime()}.png`,
        Body: buffer,
        ACL: "public-read",
        ContentType: "image/png"
      })
      .promise();

    console.log("🌌 response", response);
    location = response.Location;
  } catch (error) {
    console.log("ERRORRRRRR", error);
    return error;
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      url: params.url,
      location
    })
  };

  return response;
};
