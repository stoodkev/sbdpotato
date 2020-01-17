const fetch = require("node-fetch");

const getPostBody = async () => {
  const api = await (await fetch(
    "https://sbdpotato.herokuapp.com/conversions"
  )).json();
  console.log(api);
  const bittrexSBD = await (await fetch(
    "https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-SBD"
  )).json();
  const bittrexBTC = await (await fetch(
    "https://api.bittrex.com/api/v1.1/public/getticker?market=USD-BTC"
  )).json();
  console.log(bittrexBTC, bittrexSBD);
  const debt = await (await fetch(
    "http://cervantes.one:8081/api/get_debt_ratio"
  )).json();
  console.log(debt);
  const sbdPrice = (bittrexSBD.result.Last * bittrexBTC.result.Last).toFixed(2);
  console.log(sbdPrice);
  return `
<center>
![sbdpotato thumb.jpg](https://files.steempeak.com/file/steempeak/sbdpotato/g7cu17sL-sbdpotato20thumb.jpg)
</center>

# Conversion Report

Now automated at 10-minute intervals, if there is STEEM present in the account the bot will sell it on the internal market for SBD at a max rate of 300 STEEM per cron interval, this rate can be adjusted in Config Vars.

Thereafter, all available SBD is placed into conversion automatically.

The code repository can be seen on this [Github link](https://github.com/stoodkev/sbdpotato).

If you would like to see the code in action, donate STEEM directly to @sbdpotato and watch the bot do its thing on https://steemd.com/@sbdpotato.

Feel free to follow the conversion progress via the links below:

Conversions in progress **([API](https://sbdpotato.herokuapp.com/conversions))**: **${numberWithCommas(
    api.current.total_sbd
  )} SBD** (${numberWithCommas(api.current.conversions)} conversions)
Total conversions since inception **([API](https://sbdpotato.herokuapp.com/conversions))**: **${numberWithCommas(
    api.total.total_sbd
  )} SBD** (${numberWithCommas(api.total.conversions)} conversions)


# Vote for this post to help fix the Steem Dollar Peg!

In case you missed it; here is **[THE LINK](https://steempeak.com/@sbdpotato/sbd-potato-peg-repair-community-initiative)** to the intro post about @sbdpotato.

TLDR, you vote for @sbdpotato's daily posts and the rewards @sbdpotato earns will be used to purchase SBD on the internal market, convert it to STEEM (reducing the SBD supply) and then the converted STEEM will be used in a circular fashion to purchase more SBD - Rinse Repeat! That's basically it!

**Today's SBD Price (Bittrex): ${sbdPrice} USD**

**Current [Debt Ratio](http://cervantes.one:8081/api/get_debt_ratio):  ${debt.debt_ratio.toFixed(
    2
  )}%**

**Target Debt Ratio: 9.90%**

# What do you get out of supporting @sbdpotato?

Well firstly by voting this post you will be helping fix SBD to get it pegged to 1 USD again as it was meant to, this could also help bring the STEEM price up with it. There is a theory that the two are circular, a strong SBD gives support to healthier STEEM prices, perhaps due to positive sentiment in the network.

In addition to doing your part to improve the economy of the Steem network, you will also earn SP curation rewards from voting the post that hopefully get decent traction.

You can set the @sbdpotato account on autovote using a service like [beta.steemvoter](https://beta.steemvoter.com), by creating a stream to autovote the @sbdpotato account at around 4 or 5 minutes as per the screenshot below. There are also other autovoter services you can use if you prefer.

<center>
![](https://i.imgur.com/5jw9oQp.png)
</center>

# Conclusion and Disclaimer

All images used a royalty-free, courtesy of pixabay.com.

As custodian of this project I, @thecryptodrive, will not derive any monetary value therefrom and undertake this under my duty as Steem consensus witness and ambassador.

When the @sbdpotato funds are no longer required to support the peg, they will be sent to @steem.dao where the community can then decide what they should be used for.

I hope the Steem community will embrace this idea of supporting the SBD peg by voting the @sbdpotato posts regularly, alone we are powerless, together we can bring about change.

# Sponsors

### If you would like to have your banner featured on the daily posts, simply upload your banner in our comments sections and pledge to vote for @sbdpotato daily and/or include @sbdpotato as a beneficiary of your own posts!
#

<hr>
<br>
<center>
<a href="https://minnowbooster.net"><img src="https://i.imgur.com/VWKiKrm.png" title="MinnowBooster"/></a>
</center>
<br>
<hr>
<center>
<a href="https://steemit.com/likwid/@likwid/likwid-2nd-layer-beneficiary-for-dapps"><img src="https://i.imgur.com/23XAxxz.png" title="Likwid"/></a>
</center>

<hr>

<center>
<H2>Project owner @thecryptodrive, consider voting for his witness via this <a href="https://steemconnect.com/sign/account-witness-vote?witness=thecryptodrive&approve=1">link</a>!</H2>
</center>


<hr>
<center>
<H2>Market buy and conversion automation code provided by @stoodkev, consider voting for his witness via this <a href="https://steemconnect.com/sign/account-witness-vote?witness=stoodkev&approve=1">link</a>!</H2>
</center>
<hr>
<center>
<H2><a href="https://steemsql.com">SteemSQL</a> access sponsored by @arcange, consider voting for his witness via this <a href="https://steemconnect.com/sign/account-witness-vote?witness=arcange&approve=1">link</a>!</H2>
</center>


<hr>

# VOTE @SBDPOTATO TO BRING BACK BALANCE TO THE FORCE!

# VOTE FOR OUR [PROPOSAL](https://steempeak.com/@thecryptodrive/no-brainer-sbd-potato-top-up-proposal) TO GET THERE FASTER!
`;
};

const getTitle = info => `SBD Potato ${info}`;
const tags = ["sbdpotato"];
let numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
module.exports = {getPostBody, getTitle, tags};
