
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/ping', (req, res) => {
  res.send('pong 🩷');
});

app.get('/login', (req, res) => {
  const client_id = process.env.TWITTER_CLIENT_ID;
  const redirect_uri = 'https://princess-takeover-3.onrender.com/callback';
  const state = Math.random().toString(36).substring(2);
  const scope = 'tweet.read tweet.write users.read offline.access';

  const twitterOAuthURL = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;

  res.redirect(twitterOAuthURL);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  console.log("OAuth redirect hit with code:", code);

  if (!code) {
    return res.status(400).send("Missing code from Twitter OAuth redirect.");
  }

  const client_id = process.env.TWITTER_CLIENT_ID;
  const client_secret = process.env.TWITTER_CLIENT_SECRET;
  const redirect_uri = 'https://princess-takeover-3.onrender.com/callback';

  try {
    const tokenResponse = await axios.post("https://api.twitter.com/2/oauth2/token", null, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      params: {
        code,
        grant_type: "authorization_code",
        client_id,
        client_secret,
        redirect_uri
      }
    });

    const access_token = tokenResponse.data.access_token;
    console.log("Received access token:", access_token);

    const updateRes = await axios.post("https://api.twitter.com/1.1/account/update_profile.json", null, {
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      params: {
        description: "Just got taken over by my Princess 👑"
      }
    });

    console.log("Profile update response:", updateRes.data);
    res.send("Profile takeover complete 💖");
  } catch (err) {
    console.error("OAuth callback error:", err.response?.data || err.message);
    res.status(500).send("Something went wrong during the Twitter takeover.");
  }
});

app.listen(port, () => {
  console.log(`Princess server running at http://localhost:${port}`);
});
