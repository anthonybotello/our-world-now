/*The Node.js 'fs' module is used to read the files which contain the necessary API keys.
The 'express' module is used to build the server using the Express.js framework.*/
const fs = require('fs');
const express = require('express');
const app = express();

//The following server configuration sets the directory that contains the static files to be served -- i.e., the Angular application.
app.use(express.static( __dirname + '/app/dist/app' ));

/*The API clients that are used by this application are set up below.
In each case the API key is read from an external file and is then used to initiate the client.*/
const newsAPIKey = fs.readFileSync('./news-api-key.txt').toString('utf-8');
const NewsAPI = require('newsapi'); 
const newsapi = new NewsAPI(newsAPIKey); //The NewsAPI client is used to retrives news articles from the NewsAPI.

const twitterAPIKey = JSON.parse(fs.readFileSync('./twitter-api-key.json'));
const Twit = require('twit'); 
const twitter = new Twit(twitterAPIKey); //The Twitter API client is used to request data about trends from the Twitter API.

const keyFilename = './google-cloud-api-key.json';
const projectId = JSON.parse(fs.readFileSync(keyFilename)).project_id;
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId, keyFilename}); //The Translate API client is used to translate data retrieved in languages other than English into English using the Google Cloud Translate API.

async function translateText(text) { //The 'translateText' function receives a list of strings as input.
    let [translations] = await translate.translate(text, 'en'); //The list is input into the Google Translate API client which returns a promise.
    return translations;
}

app.get('/news/:countryCode', (req, res) => { 
//This route is used by the Angular app's HTTP service to retrieve news data using the NewsAPI client.
//The route parameter is the selected country's alpha 2 code required by the API client.
    newsapi.v2.topHeadlines({country: req.params.countryCode})
        .then(result => {
            //The client returns a JSON object containing a list of news articles;
            let articles = result.articles;
            let titles = articles.map(a => a.title.replace(/ - .+/,'')); //A separate list of titles is defined in order to translate them to English.
            //The titles are of the form '[Title] - Source'. The 'replace' method simply removes the source from the title as that will be included elsewhere.

            if (articles.length === 0){
                //If no news articles are available for the selected country then an empty array is sent to the HTTP service.
                res.json(articles);
            }
            else{
                //If there are articles available then they are processed before they are set to the HTTP service.
                translateText(titles) //The 'translateText' function is used to translate the list of titles.
                .then(translations => {
            
                    const validImgUrl = RegExp(/(http(s?):)?([/|.|\w|\s|-])*\.(?:jpg|gif|png)/); //This regular expression is used as a pattern for a valid image url.
                    
                    for (let i = 0; i < translations.length; i++){
                        //Each article in the list of articles has its title replaced by the translated title.
                        articles[i].title = translations[i];

                        if (!validImgUrl.test(articles[i].urlToImage)){
                            //The previous regular expression is used to ensure that each article has a useable image url.
                            //If the provided image url is not valid, it is replaced with a stock image url.
                            articles[i].urlToImage = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg';
                        }
                    }
                    //The updated list of news articles is then sent to the application's HTTP service as a JSON object.
                    res.json(articles);
                })
                //The only known error returned by the Translation API client is caused when inputting an empty array into the 'translateText' function. This is prevented by the first conditional statement above.
                .catch(error => res.json(error));
            }
        })//There are no known errors returned by the News API client. A lack of news data for a selected country is handled on the front-end.
        .catch(error => res.json(error));
});

app.get('/twitter/:woeid', (req, res) => {
//This route is used by the HTTP service to retrieve Twitter data using the Twitter API client.
//The route parameter is the selected country's WOEID (Where on Earth ID) required by the API client.
    twitter.get('trends/place', {id: req.params.woeid})
        .then(result => {
            //The client returns a JSON object containing a list of Twitter trend objects.
            let trends = result.data[0].trends.sort(compare); //The list of trend objects is sorted using the compare function defined below.
            let trendNames = trends.map(t => t.name); //A separate list of trend names is defined in order to translate them into English.
            
            translateText(trendNames) //The 'translateText' function is used to translate the list of trend names.
                .then(translations => {
                    //Once the translations are returned, the translated names are added to the corresponding trend object as a new field.
                    for (let i = 0; i < trends.length; i++){
                        trends[i].translatedName = translations[i]; 
                    }
                    //The updated list of trend objects is then sent to the application's HTTP service as a JSON object.
                    res.json(trends); 
                })
                .catch(error => res.json(error));
        }) //The front-end is written so that it is impossible for the server to receive a request for unavailable Twitter data. Hence, there are no known errors that should be returned.
        .catch(error => res.json(error));
    
    function compare(a, b){ 
    //The 'compare' function is used with the JavaScript Array 'sort' method.
        a.tweet_volume = (a.tweet_volume === null) ? 0 : a.tweet_volume;
        b.tweet_volume = (b.tweet_volume === null) ? 0 : b.tweet_volume;
    //This function orders Twitter trend objects by tweet_volume in descending order.
        return b.tweet_volume - a.tweet_volume; 
    }
});

app.all('*', (req, res) => {
//This route redirects any requests not matching the previous two routes to the homepage.
    res.sendFile(__dirname + '/app/dist/app/index.html');
});

app.listen(4200);