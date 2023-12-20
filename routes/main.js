module.exports = function (app, webData) {

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

    // Setting up rate limiter to prevent abuse
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // Limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    // Enabling Cross-Origin Resource Sharing
    app.use(cors());

    // Route for home page
    app.get('/', function (req, res){
        res.render('index.ejs', webData);
    });

    // Route for about page
    app.get('/about', function (req, res){
        res.render('about.ejs', webData);
    });

    // Route for search page
    app.get('/search', function (req, res){
        res.render("search.ejs", webData);
    });

    // Route for handling search results with validation checks
    app.get('/search-result', [
        check('keyword').isLength({ min: 1 }).withMessage('Keyword cannot be empty'),
    ], function (req, res) {
        const errors = validationResult(req);
      
        if (!errors.isEmpty()) {
            res.render('index.ejs', { webApp: 'vitAI', error: 'Keyword cannot be empty' });
        } else {
            const searchKeyword = req.query.keyword;
      
            // Database search query
            let query = 'SELECT * FROM ratings WHERE name LIKE ?';
            const searchTerm = `%${searchKeyword}%`;
            db.query(query, [searchTerm], (err, results) => {
                if (err) {
                    res.status(500).send('Internal Server Error');
                } else {
                    // Displaying search results
                    res.render('search-result.ejs', { webApp: 'vitAI', searchKeyword, results });
                }
            }); 
        }
    });
}
