const express = require("express");
const router = new express.Router();
const sql = require("mssql");
const config = require("../config");
router.get("/conversions", async (req, res) => {
  const conversions = {
    current: await getConversions(),
    total: await getConversions(true)
  };
  res.send(conversions);
});

const getConversions = total => {
  const query = `
    SELECT SUM(amount)as total_sbd ,COUNT(amount) as conversions from TxConverts
    WHERE owner='sbdpotato' ${
      total ? "" : "AND timestamp >= DATEADD(hour,-84, GETUTCDATE())"
    }`;
  return new sql.ConnectionPool(config.config_api)
    .connect()
    .then(pool => {
      return pool.request().query(query);
    })
    .then(result => {
      sql.close();
      return result.recordsets[0][0];
    })
    .catch(error => {
      console.log(error);
      sql.close();
    });
};

module.exports = router;
