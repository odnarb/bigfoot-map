import fs from 'fs'
import { YoutubeTranscript } from 'youtube-transcript';

const playlistId = ''
const folder = 'data/HowToHuntChannels'

const videosMap = {}
const videosResults = {}

const PROMISES_BATCH_LIMIT = 20

function isEmpty(str) {
    return str === null || str === undefined || str.trim() === ''
}

async function getAllVideoIds() {
    let nextPageToken = 'first'
    let first = true
    while(!isEmpty(nextPageToken)){
        if(first) {
            first = false
            nextPageToken = ''
        }

        // make get request
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`

        if (!isEmpty(nextPageToken)) {
            url += `&pageToken=${nextPageToken}`
        } 
        const res = await fetch(url)
        const playlist = await res.json()

        // save json data per request
        for(const item of playlist.items){
            const { videoId } = item.snippet.resourceId
            if(videosMap[videoId]) {
                const { title, description, channelTitle } = item.snippet
                videosMap[videoId] = {title, description, channelTitle }
            } else {
                console.log(`Skipping already fetched video ${videoId}...`)
            }
        }

        nextPageToken = playlist.nextPageToken
    }

    fs.writeFileSync(`${folder}/allChannelVideos.json`, JSON.stringify(Object.keys(videosMap)))
}

function transScriptFetched(fileName) {
    return fs.existsSync(fileName)
}

function getAllVideosAndTranscriptsFetched() {
    //if we already fetched all video ids, exit
    const allVideosFileName = `${folder}/allChannelVideos.json`
    if(fs.existsSync(allVideosFileName)) {
        const videos = JSON.parse(fs.readFileSync(allVideosFileName))
        for(const video of videos){
            videosMap[video] = 1
        }
    }

    for(const video in videosMap){
        const fileName = `${folder}/${video}-transcript.json`

        if(transScriptFetched(fileName) ) {
            delete videosMap[video]
        }
    }
}

//TODO: sometimes transcripts are disabled for a video
async function getAllVideoTranscripts() {
    while(Object.keys(videosMap).length > 0) {
        const videoIds = Object.keys(videosMap)

        const promises = []
        for(const video of videoIds){
            if(promises.length < PROMISES_BATCH_LIMIT) {
                promises.push(getVideoTranscript(video))
            }
        }

        const results = await Promise.allSettled(promises)

        for(const result of results){
            if(result.status === 'rejected') {
                console.error(result.reason)
            } else {
                const { video, transcript, error} = result.value
                if(error) {
                    videosResults[video] = error
                } else {
                    const {title, description, channelTitle } =  videosMap[video]
                    fs.writeFileSync(`${folder}/${video}-transcript.json`, JSON.stringify({ video, title, description, channelTitle, transcript }))
                }
                delete videosMap[video]
            }
        }
    }
}

async function getVideoTranscript(video) {
    try {
        console.log(`Getting transcript for video ${video}...`)
      const transcript = await YoutubeTranscript.fetchTranscript(video)
      return { video, transcript }
    } catch (error) {
        console.error(`Could not fetch transcript for video id ${video}. ${error.stack}`)
        return { video, error: error.stack }
    }
}

async function main () {
  getAllVideosAndTranscriptsFetched()

  //get all videos
  await getAllVideoIds()

  //get all transcripts
  await getAllVideoTranscripts()

  fs.writeFileSync(`${folder}/videos-transcripts-results.json`, JSON.stringify(videosResults))

}

main().then(() => console.log('done'))