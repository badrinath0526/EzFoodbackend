const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const axios = require("axios");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = "hahahaha";
router.post(
    "/createuser",
    [
      body("email", "Invalid Email").isEmail(),
      body("name").isLength({ min: 3 }),
      body("password", "Password should be minimum 5 characters long").isLength({
        min: 5,
      }),
    ],
    async (req, res) => {
      let success = false;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }
  
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);
  
      try {
        const user = await User.create({
          name: req.body.name,
          password: secPassword,
          email: req.body.email,
          location: req.body.location,
        });
        res.json({success:true})
      } catch (error) {
        console.log(error);
        res.json({success:false});
      }
    }
  );
  

router.post(
  "/loginuser",
  [
    body("email", "Invalid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    let email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let userData = await User.findOne({ email });
      if (!userData) {
        return res.status(400).json({ errors: "Wrong credentials" });
      }

      const pwdCompare = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (!pwdCompare) {
        return res.status(400).json({ errors: "Wrong credentials" });
      }

      const data = {
        user: {
          id: userData.id,
        },
      };

      success = true;
      const authToken = jwt.sign(data, jwtSecret);

      return res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.log(error.message);
      res.send("Server Error");
    }
  }
);

router.post("/getlocation", async (req, res) => {
  try {
    let lat = req.body.latlong.lat;
    let long = req.body.latlong.long;
    console.log(lat, long);
    let location = await axios
      .get(
        "https://api.opencagedata.com/geocode/v1/json?q=" +
          lat +
          "+" +
          long +
          "&key=74c89b3be64946ac96d777d08b878d43"
      )
      .then(async (res) => {
        // console.log(`statusCode: ${res.status}`)
        //console.log(res.data.results);
        // let response = stringify(res)
        // response = await JSON.parse(response)
        let response = res.data.results[0].components;
        //console.log(response);
        let { village, county, state_district, state, postcode } = response;
        return String(
          village +
            "," +
            county +
            "," +
            state_district +
            "," +
            state +
            "\n" +
            postcode
        );
      })
      .catch((error) => {
        console.error(error);
      });
    res.send({ location });
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

module.exports = router;
