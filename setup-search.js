const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const links = fs.readFileSync('episode-list-links.txt', 'utf8').split('\n').map(link => {
    const pattern = /<a href="mp3s\/([^"]+)" download>(.+) \((.+)\)/;
    const matches = link.match(pattern);
    if (matches) {
      const { 1: fileName, 2: title, 3: date } = matches;
      const dateObject = new Date(`${date.substring(0, 2)}/${date.substring(3, 5)}/${date.substring(6)}`);
      const json = { fileName, title, date: dateObject };
      return json;
    }
  }).filter(link => link);


// Create or open the database
const db = new sqlite3.Database('db_output/pcp-archive-search.db');

// Create FTS table with additional columns
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fileName TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE
    )
  `);

  // Insert data
  const stmt = db.prepare("INSERT INTO episodes (fileName, title, date) VALUES (?, ?, ?)");

  links.forEach(episode => {
    console.log(episode)
    stmt.run(episode.fileName, episode.title, episode.date);
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

  // Read and insert all SRT files from the 'srt_output' directory (this takes a while. an hour?)
  fs.readdirSync('./srt_output').forEach(file => {
    if (path.extname(file) === '.srt') {
      insertData(path.join('./srt_output', file));
    }
  });
  
  console.log('Database setup.');
});

// Close the database connection
db.close();
