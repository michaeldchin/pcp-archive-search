const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const inputFilePath = 'episode-list-links.txt'; // Your input text file containing the links
const BASE_URL = 'https://www.theprocrastinatorspodcast.com/'

const downloadFile = async (fileUrl, outputLocationPath) => {
    const writer = fs.createWriteStream(outputLocationPath);

    const response = await axios({
        url: BASE_URL + fileUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

const main = async () => {
    try {
        const fileStream = fs.createReadStream(inputFilePath);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const urlMatch = line.match(/href="(mp3s\/[^"]+)"/);
            if (urlMatch && urlMatch[1]) {
                const fileUrl = urlMatch[1];
                const fileName = path.basename(fileUrl);
                const outputPath = path.resolve(__dirname, 'downloads', fileName);

                // Ensure the downloads directory exists
                if (!fs.existsSync(path.dirname(outputPath))) {
                    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                }

                console.log(`Downloading ${fileName}...`);
                await downloadFile(fileUrl, outputPath);
                console.log(`${fileName} downloaded successfully.`);
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
};

main();
