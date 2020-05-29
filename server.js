const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.static( __dirname + '/app/dist/app' ));
app.use(express.urlencoded({extended:true}));

const newsAPIKey = fs.readFileSync('./news-api-key.txt').toString('utf-8');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsAPIKey);

const twitterAPIKey = JSON.parse(fs.readFileSync('./twitter-api-key.json'));
const Twit = require('twit');
const twitter = new Twit(twitterAPIKey);

const keyFilename = './google-cloud-api-key.json';
const projectId = JSON.parse(fs.readFileSync(keyFilename)).project_id;
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId, keyFilename});

async function translateText(text) {
    let [translations] = await translate.translate(text, 'en');
    translations = Array.isArray(translations) ? translations : [translations];
    return translations;
}

app.get('/news/:countryCode', (req, res) => {
    newsapi.v2.topHeadlines({country: req.params.countryCode})
        .then(async (result) => {
            let articles = await updateArticles(result.articles);
            res.json(articles);
        })
        .catch(error => res.json(error));
    
    async function updateArticles(articles){
        if (articles.length > 0){
            let titles = articles.map(a => a.title.replace(/ - .+/,''));
            articles = await translateText(titles)
                .then(translations => {
                    const validImgUrl = RegExp(/(http(s?):)?([/|.|\w|\s|-])*\.(?:jpg|gif|png)/); 
                    for (let i = 0; i < translations.length; i++){
                        articles[i].title = translations[i];

                        if (!validImgUrl.test(articles[i].urlToImage)){
                            articles[i].urlToImage = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg';
                        }
                    }
                    return articles;
                })
                .catch(error => error);
        }
        return articles;
    }
});

app.get('/twitter/:woeid', (req, res) => {
    twitter.get('trends/place', {id: req.params.woeid})
        .then(result => {
            let trends = result.data[0].trends.sort(compare);
            let trendNames = trends.map(t => t.name);
            translateText(trendNames)
                .then(translations => {
                    for (let i = 0; i < trends.length; i++){
                        trends[i].translatedName = translations[i];
                    }
                    res.json(trends);
                })
                .catch(error => res.json(error));
        })
        .catch(error => res.json(error));
    
    function compare(a, b){
        a.tweet_volume = (a.tweet_volume === null) ? 0 : a.tweet_volume;
        b.tweet_volume = (b.tweet_volume === null) ? 0 : b.tweet_volume;
        return b.tweet_volume - a.tweet_volume;
    }
});

app.all('*', (req, res) => {
    res.sendFile(__dirname + '/app/dist/app/index.html');
});

app.listen(5000);