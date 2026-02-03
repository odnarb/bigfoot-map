import { YoutubeTranscript } from 'youtube-transcript';

import fs from 'fs'


const videoId = 'U0iUUIAu_-Q'

async function getVideoTranscriptFromService(){

  const res = await fetch("https://www.youtube-transcript.io/api/transcripts", {
    method: "POST",
    headers: {
      "Authorization": "Basic xxxxxxx--your---api---key",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      ids: [videoId], 
    })
  })

    const content = await res.json()

    fs.writeFileSync(`${videoId}.log`, JSON.stringify(content))
}

async function main () {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId)

  fs.writeFileSync(`${videoId}-manual.json`, JSON.stringify(transcript))
}

main().then(() => console.log('done'))