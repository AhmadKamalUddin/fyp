module.exports = function (app, webData) {
    const webApp = "vitAI";

    // Importing necessary modules for validation, rate limiting, CORS and HTTP requests
    const { check, validationResult } = require('express-validator');
    const rateLimit = require('express-rate-limit');
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

    // Route for registration page
    app.get('/register', function (req, res) {
        res.render('register.ejs', webData);                                                                     
    }); 

    // Route for processing registration with validation checks
    app.post('/registered', 
        [check('email').isEmail()],
        [check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')], 
        function (req, res) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.redirect('./register'); 
            } else {
                // Check for existing user and insert new user
                let existingUserQuery = "SELECT * FROM userdetails WHERE username = ?";
                db.query(existingUserQuery, [req.sanitize(req.body.username)], (err, result) => {
                    if (err) {
                        return res.status(500).send('Internal Server Error');
                    }
                    if (result.length > 0) {
                        return res.send('Username already exists. Please choose another username.');
                    }

                    // Hashing password and saving user details
                    const bcrypt = require('bcrypt');
                    const saltRounds = 10;
                    const plainPassword = req.sanitize(req.body.password);

                    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
                        let sqlquery = "INSERT INTO userdetails (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
                        let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.sanitize(req.body.email), hashedPassword];
    
                        db.query(sqlquery, newrecord, (err, result) => {
                            if (err) {
                                return console.error(err.message);
                            } else {
                                let successMessage = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) + ', you are now registered! We will send an email to ' + req.body.email;
                                res.send(successMessage + '<a href="./">Home</a>');
                            }
                        });
                    });
                });
            }   
        }
    );

    // Route for login page
    app.get('/login', function (req, res) {
        res.render('login.ejs', webData);                                                                     
    });

    // Route for processing login
    app.post('/loggedin',function (req, res) {
        
        // Validate login credentials
        const bcrypt = require('bcrypt');
        const username = req.sanitize(req.body.username);
        const enteredPassword = req.sanitize(req.body.password);

        // Set user session on successful login
        req.session.userId = username;

        // Fetch hashed password from database
        let sqlQuery = "SELECT hashedPassword FROM userdetails WHERE username = ?";
        db.query(sqlQuery, [username], (err, result) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }

            if (result.length === 0) {
                return res.send('Login failed. User not found.');
            }

            const hashedPassword = result[0].hashedPassword;

            // Compare entered and stored hashed passwords
            bcrypt.compare(enteredPassword, hashedPassword, function (err, result) {
                if (err) {
                    return res.status(500).send('Internal Server Error');
                } else if (result === true) {
                    return res.send('Login successful. <a href="./">Home</a>');
                } else {
                    return res.send('Login failed. Incorrect password. <a href="./">Home</a>');
                }
            });
        });
    });

    // Route for logout
    app.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./');
            }
            res.send('You are now logged out. <a href="./">Home</a>');
        });
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
            console.log("API Response:", body);
            // Renders the template with the response, userQuery, and conversationId
            res.render('index', { 
                webApp: webApp, // or just the webApp
                responseuserQuery: body.response, 
                 userQuery, 
                conversationId: body.conversationId || req.body.conversationId
            });
        });
    });
}
