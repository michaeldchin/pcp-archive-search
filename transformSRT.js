const fs = require('fs');
const path = require('path');

// Input and output directories
const inputDir = 'srt_output';
const outputDir = 'transcript_archive';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Read all files in the input directory
const files = fs.readdirSync(inputDir);

// Filter to include only .srt files
const srtFiles = files.filter(file => path.extname(file) === '.srt');

// Process each SRT file
srtFiles.forEach(file => {
    const filePath = path.join(inputDir, file);

    // Read the SRT file
    const data = fs.readFileSync(filePath, 'utf8');

    // Split the content by new lines and remove empty lines
    const lines = data.split('\n').filter(line => line.trim() !== '');

    let output = '';

    // Loop through each line and format it
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
            let startTime = lines[i].split(' --> ')[0];
            startTime = startTime.split(',')[0];
            output += `${startTime} ${lines[i + 1].trim()}\n`;
            i++;
        }
    }

    // Write the output to a new TXT file
    const outputFilePath = path.join(outputDir, path.basename(file, '.srt') + '.txt');
    fs.writeFileSync(outputFilePath, output, 'utf8');
    console.log(`File transformed successfully: ${outputFilePath}`);
});
