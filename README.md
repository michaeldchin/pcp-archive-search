# From chat GPT prompt:
```
write a node js script to download all the files from a site https://www.theprocrastinatorspodcast.com/ 
with the format of each link url being like 
<p><a href="mp3s/Pro-Crastinators-Podcast-0001.mp3" download>Episode 1: Best Game Ever (12/05/2015)</a></p>
```

I did right click view-source on https://www.theprocrastinatorspodcast.com/episodes.html and put those in `episode-list-links.txt`

Installed node js dependencies
`npm install axios fs readline`

ran the download episodes program courtesy of chat-GPT
`node download-episodes.js` 
