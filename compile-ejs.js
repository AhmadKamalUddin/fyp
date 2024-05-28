// For deploying on Netlify
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define webData with webApp as 'vitAI'
const webData = { webApp: 'vitAI' };

// Specify the views directory and the output directory
const viewsDir = path.join(__dirname, 'views');
const outputDir = path.join(__dirname, 'public');

// Ensure the output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Compile each EJS file found in the views directory
glob(`${viewsDir}/**/*.ejs`, (err, files) => {
  if (err) {
    console.error('Error finding EJS files:', err);
    process.exit(1);
  }

  files.forEach(file => {
    const outputPath = file.replace(viewsDir, outputDir).replace('.ejs', '.html');
    const data = fs.readFileSync(file, 'utf-8');
    
    // Pass webData as a parameter to ejs.render
    const compiled = ejs.render(data, webData);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, compiled);
    console.log(`Compiled ${file} to ${outputPath}`);
  });
});