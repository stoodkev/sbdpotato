module.exports = (req, res, next) => {
  if (req.header("Auth") === process.env.MASTER) next();
  else res.sendStatus(401);
};
