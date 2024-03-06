// Import the modules we need
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
const mysql = require('mysql');
var session = require('express-session');

// Create the express application object
const app = express();
const port = 8000;
const expressSanitizer = require('express-sanitizer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());

// Set up css
app.use(express.static(__dirname + '/public'));

// Create a session
app.use(
  session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);

// Define the database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'appuser',
  password: 'qwerty',
  database: 'ai'
});
// Connect to the database
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});
global.db = db;

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// Define our data
var webData = { webApp: 'vitAI' };

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require('./routes/main')(app, webData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Implement NLP functionality by installing the node-nlp module
const { NlpManager } = require('node-nlp');

// Create an instance of NlpManager and ensure the language is english
const manager = new NlpManager({ languages: ['en'] });

// Add some training data as this adds responses based on users inputs and this is used for training.
manager.addDocument('en', 'hello', 'greetings.hello');
manager.addDocument('en', 'hi', 'greetings.hi');
manager.addDocument('en', 'hey', 'greetings.hey');
manager.addDocument('en', 'yo', 'greetings.yo');
manager.addDocument('en', 'how are you?', 'greetings.how_are_you');
manager.addDocument('en', 'what can you do?', 'greetings.what_can_you_do');
manager.addDocument('en', 'kl', 'greetings.kl');

manager.addDocument('en', 'goodbye', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'stop', 'greetings.bye');

// Define responses
manager.addAnswer('en', 'greetings.hello', 'Hello there!');
manager.addAnswer('en', 'greetings.hi', 'Hi there!');
manager.addAnswer('en', 'greetings.hey', 'Heyyyy!');
manager.addAnswer('en', 'greetings.yo', 'Yo!');
manager.addAnswer('en', 'greetings.bye', 'Till next time!');
manager.addAnswer('en', 'greetings.how_are_you', 'I am fine, thank you!');
manager.addAnswer('en', 'greetings.what_can_you_do', 'I am an AI chatbot. I will try and help you with anything. Ask me something!');
manager.addAnswer('en', 'greetings.kl', 'Yh! I am pretty cool');

// Train the model using the manager and what inputs are given to the manager
(async () => {
    await manager.train();
    manager.save();
})();

// Terminal implementation using readline so I can respond in terminal
const readline = require('readline');

//readline or rl used as variable to set user input and bot output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//set user input
rl.setPrompt('You: ');
rl.prompt();

//set bot output based on the training given to the manager
rl.on('line', async line => {
    const response = await manager.process('en', line);
    if (response.answer) {
      console.log('Bot:', response.answer);
    } else {
      console.log("Bot: I'm pretty new at this. Please rephrase or try again later.");
    }
    rl.prompt();
  });