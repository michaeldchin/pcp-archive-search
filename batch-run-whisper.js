const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Define input and output directories
const inputDir = path.join(__dirname, 'downloads');
const outputDir = path.join(__dirname, 'whisper_output');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to process files with Whisper
const processFiles = () => {
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        files.forEach(file => {
            const inputFilePath = path.join(inputDir, file);

            // Run the Whisper command
            const command = `whisper ${inputFilePath} --output_dir ${outputDir} --language English --initial_prompt "This is a podcast called The Pro Crastinators Podcast. A variety podcast running since 2015. Currently hosted by are Ben Saint and Gibbontake(or Hippocrit). Members have included Nate Bestman, Endless Jess, Digibro, Mumkey Jones, Geoff Thew, Tom Oliver, The Davoo, Mage, and Munchy."`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error processing file ${file}:`, error);
                    return;
                }

                console.log(`Successfully processed file ${file}`);
                if (stdout) console.log('stdout:', stdout);
                if (stderr) console.log('stderr:', stderr);
            });
        });
    });
};

// Start processing files
processFiles();
