const express = require("express");
const { db, auth } = require("../../firebase");

const routes = express.Router();

routes.route("/api/test").get(async (req, res) => {
  const idToken = req.headers.idtoken;
  auth
    .verifyIdToken(idToken)
    .then(async (resp) => {
      console.log(resp);
      const docRef = db.collection("budgetData").doc(resp.uid + "tt");

      await docRef.set({
        first: "Ada",
        last: "Lovelace",
        born: 1815,
      });

      res.json({ user: "tobi" });
    })
    .catch((error) => {
      console.log("Error verifying id token");
      res.status(401).json({ error: "Unauthorized" });
    });
});

// This section will help you get a single record by id
// routes.route("/record/:id").get(function (req, res) {
//  let db_connect = dbo.getDb();
//  let myquery = { _id: ObjectId(req.params.id) };
//  db_connect
//    .collection("records")
//    .findOne(myquery, function (err, result) {
//      if (err) throw err;
//      res.json(result);
//    });
// });

// This section will help you create a new record.
// routes.route("/record/add").post(function (req, response) {
//  let db_connect = dbo.getDb();
//  let myobj = {
//    name: req.body.name,
//    position: req.body.position,
//    level: req.body.level,
//  };
//  db_connect.collection("records").insertOne(myobj, function (err, res) {
//    if (err) throw err;
//    response.json(res);
//  });
// });

module.exports = routes;
