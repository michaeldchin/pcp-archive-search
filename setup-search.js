const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync('episode-list-links.txt', 'utf8');
// Parse the HTML content
const dom = new JSDOM(htmlContent);
const document = dom.window.document;
// Extract data
const links = document.querySelectorAll('p > a');
const episodes = Array.from(links).map(link => {
  const href = link.getAttribute('href');
  const fileName = href.replace('mp3s/', '').replace('.mp3', '');
  const innerHTML = link.innerHTML;
  return { fileName, innerHTML };
});


// Create or open the database
const db = new sqlite3.Database('db_output/pcp-archive-search.db');

// Create FTS table with additional columns
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fileName TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);

  // Insert data
  const stmt = db.prepare("INSERT INTO episodes (fileName, description) VALUES (?, ?)");

  episodes.forEach(episode => {
    stmt.run(episode.fileName, episode.innerHTML);
  });

  db.run("CREATE VIRTUAL TABLE IF NOT EXISTS srt USING fts5(filename, block_number, start_time, text)");

  // Function to insert data into the FTS table
  function insertData(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    
    let blockNumber = null;
    let startTime = null;
    const stmt = db.prepare("INSERT INTO srt (filename, block_number, start_time, text) VALUES (?, ?, ?, ?)");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Check for block number
      if (/^\d+$/.test(line)) {
        blockNumber = line;
      } 
      // Check for timestamp line
      else if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(line)) {
        startTime = line.split(' --> ')[0]; // Extract start timestamp
      } 
      // Otherwise, it's text
      else {
        stmt.run(path.basename(filePath), blockNumber, startTime, line);
        console.log(`Inserted: ${path.basename(filePath)}, ${blockNumber}, ${startTime}, ${line}`);
      }
    }

    stmt.finalize();
  }

  // Read and insert all SRT files from the 'whisper_output' directory
  fs.readdirSync('./whisper_output').forEach(file => {
    if (path.extname(file) === '.srt') {
      insertData(path.join('./whisper_output', file));
    }
  });
  
  console.log('Database setup.');
});

// Close the database connection
db.close();
