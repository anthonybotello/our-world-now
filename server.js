const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const newsAPIKey = fs.readFileSync('./news-api-key.txt', (err, data) => data).toString('utf-8');

app.use(express.static( __dirname + '/app/dist/app' ));
app.use(express.urlencoded({extended:true}));

app.get('/news/:countryCode', (req, res) => {
    let url = `http://newsapi.org/v2/top-headlines?country=${req.params.countryCode}&apiKey=${newsAPIKey}`;
    axios.get(url)
        .then(result => {res.json(result.data)})
        .catch(error => {res.json(error)});
});

app.all('*', (req, res) => {
    res.sendFile(__dirname + '/app/dist/app/index.html');
});

app.listen(5000);