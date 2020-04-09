const express = require("express");
const router = new express.Router();
const steem = require("steem");
const getJSON = require("get-json");

const {
  ACCOUNT,
  WIF,
  MAX_BUY,
  POSTS_PER_DAY,
  POSTING,
  MAX_ACCEPTED_SBD,
  COMMENTS_PER_POST,
  BENEFICIARY
} = process.env;
const auth = require("../middlewares/auth");
const {getPostBody, getTitle, tags} = require("../templates/post");

router.post("/convert", auth, (req, res) => {
  convert();
  res.sendStatus(200);
});

router.post("/post", auth, (req, res) => {
  if ((new Date().getHours() + 2) % (24 / POSTS_PER_DAY) === 0) post();
  res.sendStatus(200);
});

const post = async () => {
  console.log("starting post");
  const date = new Date()
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "/");
  const iteration = Math.ceil(new Date().getHours() / (24 / POSTS_PER_DAY));
  console.log(iteration);
  const title = getTitle(`${date} #${iteration}`);
  console.log(title);
  const permlink =
    title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/\//g, "-")
      .replace(/#/g, "") + Date.now();
  console.log(permlink);
  const json_metadata = {tags};
  const body = await getPostBody();

  console.log(body, json_metadata);
  const extensions = BENEFICIARY
    ? [[0, {beneficiaries: [{account: BENEFICIARY, weight: 10000}]}]]
    : [];
  console.log(tags[0], JSON.stringify(extensions));
  var operations = [
    [
      "comment",
      {
        parent_author: "",
        parent_permlink: tags[0],
        author: ACCOUNT,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: JSON.stringify({
          app: "sbdpotatobot",
          format: "markdown",
          tags
        })
      }
    ],
    [
      "comment_options",
      {
        author: ACCOUNT,
        permlink: permlink,
        max_accepted_payout: MAX_ACCEPTED_SBD,
        percent_steem_dollars: 10000,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions
      }
    ]
  ];
  console.log(operations);
  await steem.broadcast.sendAsync({operations, extensions: []}, [POSTING]);
  for (let i = 1; i <= COMMENTS_PER_POST; i++) {
    await timeout(3000);
    operations = [
      [
        "comment",
        {
          parent_author: ACCOUNT,
          parent_permlink: permlink,
          author: ACCOUNT,
          title: `Additional vote #${i}`,
          permlink: `${permlink}re-${i}`,
          body: `Additional vote #${i}`,
          json_metadata: JSON.stringify({})
        }
      ],
      [
        "comment_options",
        {
          author: ACCOUNT,
          permlink: `${permlink}re-${i}`,
          max_accepted_payout: MAX_ACCEPTED_SBD,
          percent_steem_dollars: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions
        }
      ]
    ];
    await steem.broadcast.sendAsync({operations, extensions: []}, [POSTING]);
  }
};

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const convert = async () => {
  let [account, priceSteem, priceBtc] = [
    await steem.api.getAccountsAsync([ACCOUNT]),
    await getPriceSteemAsync(),
    await getBTCPriceAsync()
  ];
  const initialSBD = account[0].sbd_balance;
  const steemBalance = account[0].balance;
  if (parseFloat(steemBalance) !== 0) {
    let amountBuy = `${parseFloat(MAX_BUY).toFixed(3)} STEEM`;
    console.log(`Buying ${amountBuy} worth of SBD.`);
    const bids = (await steem.api.getOrderBookAsync(500)).bids;
    console.log(bids);
    let sbd = 0.001;
    let STEEM = 0;
    const priceSteemUSD = priceSteem * priceBtc;
    console.log(`1 STEEM=$${priceSteemUSD}`);
    for (const bid of bids) {
      if ((priceSteemUSD / bid.sbd) * bid.steem > 1) {
        amountBuy = `${parseFloat(STEEM).toFixed(3)} STEEM`;
        console.log("too expensive:", bid);
        break;
      }
      STEEM += bid.steem / 1000;
      if (STEEM >= MAX_BUY) break;
      sbd += bid.sbd / 1000;
    }
    console.log(`Getting at least ${sbd} SBD for ${amountBuy}`);
    const orderID = getID();
    const expiration = parseInt(new Date().getTime() / 1000 + 10);
    const order = await steem.broadcast.limitOrderCreateAsync(
      WIF,
      ACCOUNT,
      orderID,
      amountBuy,
      `${sbd.toFixed(3)} SBD`,
      true,
      expiration
    );
    await timeout(5000);
    account = await steem.api.getAccountsAsync([ACCOUNT]);
    console.log(
      `Bought ${parseFloat(account[0].sbd_balance) -
        parseFloat(initialSBD)} SBD for ${amountBuy}.`
    );
  } else console.log("No STEEM to buy SBD.");
  const sbd = account[0].sbd_balance;
  if (parseFloat(sbd) !== 0) {
    const convert = await steem.broadcast.convertAsync(
      WIF,
      ACCOUNT,
      getID(),
      sbd
    );
    console.log(`Started conversion of ${sbd}.`);
  } else console.log("Nothing to convert!");
};

const getID = () => Math.floor(Math.random() * 10000000);

function getPriceSteemAsync() {
  return new Promise(function(resolve, reject) {
    getJSON(
      "https://bittrex.com/api/v1.1/public/getticker?market=BTC-STEEM",
      function(err, response) {
        resolve(response.result["Bid"]);
      }
    );
  });
}

function getBTCPriceAsync() {
  return new Promise(function(resolve, reject) {
    getJSON(
      "https://bittrex.com/api/v1.1/public/getticker?market=USDT-BTC",
      function(err, response) {
        resolve(response.result["Bid"]);
      }
    );
  });
}

module.exports = router;
