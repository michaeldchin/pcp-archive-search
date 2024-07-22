const sqlite3 = require('sqlite3').verbose();

// Create or open the database
const db = new sqlite3.Database('db_output/pcp-archive-search.db');

// Function to search the FTS table
function searchSrtFiles(query) {
  // Process the query to handle multiple words
  const processedQuery = query.split(/\s+/).map(term => `"${term}"`).join(' AND ');

  db.serialize(() => {
    db.all(`SELECT filename, block_number, start_time, text FROM srt WHERE text MATCH ?`, [processedQuery], (err, rows) => {
      if (err) {
        throw err;
      }

      if (rows.length > 0) {
        rows.forEach(row => {
          console.log(`File: ${row.filename}, Block: ${row.block_number}, Start Time: ${row.start_time}, Text: ${row.text}`);
        });
      } else {
        console.log('No matches found.');
      }
    });
  });

  db.close();
}

// Example usage: Run the search function with a space-separated string of terms
const searchTerm = process.argv.slice(2).join(' '); // Get the search term from command-line arguments
if (searchTerm) {
  searchSrtFiles(searchTerm);
} else {
  console.log('Please provide a search term.');
}
