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


whisper downloads/Pro-Crastinators-Podcast-0001.mp3 --language English --output_dir whisper_output --initial_prompt "This is a podcast called The Pro Crastinators Podcast. A variety podcast running since 2015. Currently hosted by are Ben Saint and Gibbontake(or Hippocrit). Members have included Nate Bestman, Endless Jess, Digibro, Mumkey Jones, Geoff Thew, Tom Oliver, The Davoo, Mage, and Munchy."
