module.exports = function (app, webData) {
    const webApp = "vitAI";

    // Middleware to redirect to login if user is not logged in
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
            res.redirect('./login');
        } else { 
            next(); 
        }
    }

    // Importing necessary modules for validation, rate limiting, CORS and HTTP requests
    const { check, validationResult } = require('express-validator');
    const rateLimit = require('express-rate-limit');
    const cors = require('cors');
    const express = require('express');
    const request = require('request');
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: true }));

    // Setting up rate limiter to prevent abuse
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // Limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    // Enabling Cross-Origin Resource Sharing
    app.use(cors());

    app.get('/', function (req, res) {
        res.render('index', { webApp: webApp, conversationId: '' });
    });

    // Route for about page
    app.get('/about', function (req, res){
        res.render('about.ejs', webData);
    });

    // Route for search page
    app.get('/search', function (req, res){
        res.render("search.ejs", webData);
    });

    app.get('/chatBot', function (req, res) {
        const options = {
            method: 'POST',
            url: 'https://chatgpt-gpt4-ai-chatbot.p.rapidapi.com/ask',
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': 'f4b5e795e9msha6da9abb3a10e70p105f08jsnb021b319baea',
              'X-RapidAPI-Host': 'chatgpt-gpt4-ai-chatbot.p.rapidapi.com'
            },
            body: {
              query: 'How to become rich?'
            },
            json: true
        };
        
        request(options, function (error, response, body) {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Error occurred');
            }
            console.log(body);
            res.send(body); // Sends a response back to the client
        });

        //API Link below
        //https://rapidapi.com/nextbaseapp/api/chatgpt-gpt4-ai-chatbot
    });

    app.post('/sendQuery', function (req, res) {
        const userQuery = req.body.userQuery;
        let conversationId = req.body.conversationId; // Retrieves the conversationId if it exists
    
        const options = {
            method: 'POST',
            url: 'https://chatgpt-gpt4-ai-chatbot.p.rapidapi.com/ask',
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': 'f4b5e795e9msha6da9abb3a10e70p105f08jsnb021b319baea',
              'X-RapidAPI-Host': 'chatgpt-gpt4-ai-chatbot.p.rapidapi.com'
            },
            body: {
              query: userQuery,
              ...(conversationId && { conversationId })
            },
            json: true
        };
    
    
        request(options, function (error, response, body) {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Error occurred');
            }
            // Renders the template with the response, userQuery, and conversationId
            res.render('index', { 
                webApp: webApp, // or just the webApp
                response: body.response, 
                userQuery: userQuery, 
                conversationId: body.conversationId || req.body.conversationId
            });
        });
    });
}
