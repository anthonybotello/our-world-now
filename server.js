const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();

const newsAPIKey = fs.readFileSync('./news-api-key.txt', (err, data) => data).toString('utf-8');

async function translateText(text) {
    let [translations] = await translate.translate(text, 'en');
    translations = Array.isArray(translations) ? translations : [translations];
    return translations;
}



app.use(express.static( __dirname + '/app/dist/app' ));
app.use(express.urlencoded({extended:true}));

app.get('/news/:countryCode', (req, res) => {
    let url = `http://newsapi.org/v2/top-headlines?country=${req.params.countryCode}&apiKey=${newsAPIKey}&pageSize=5`;
    axios.get(url)
        .then(result => {
            let articles = result.data.articles.map(a => a.title);
            translateText(articles)
                .then(a => {
                    const validImgUrl = RegExp(/(http(s?):)?([/|.|\w|\s|-])*\.(?:jpg|gif|png)/); 
                    for (let i = 0; i < a.length; i++){
                        if (!validImgUrl.test(result.data.articles[i].urlToImage)){
                            result.data.articles[i].urlToImage = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg';
                        }
                        result.data.articles[i].title = a[i].replace(/ - .+/,'');
                    }
                    res.json(result.data);
                })
                .catch(err => res.json(result.data));
        })
        .catch(error => {res.json(error)});
});

app.all('*', (req, res) => {
    res.sendFile(__dirname + '/app/dist/app/index.html');
});

app.listen(5000);