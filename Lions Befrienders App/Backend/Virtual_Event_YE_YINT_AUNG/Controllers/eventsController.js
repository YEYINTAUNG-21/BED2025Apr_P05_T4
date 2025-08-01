const EventsModel = require('../Models/eventsModel');
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchYoutubeVideoDetails(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);
    if (!response.data.items.length){
        throw new Error('Invalid YouTube video ID');
    }
    const video = response.data.items[0];
    return {
        thumbnail: video.snippet.thumbnails.medium.url,
        video_title: video.snippet.title,
        duration: video.contentDetails.duration
    };
}

async function searchYoutubeVideos(keyword) {
    const url = 'https://www.googleapis.com/youtube/v3/search'
    const params = {
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY
    };

    const response = await axios.get(url, {params});
    return response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedTime: item.snippet.publishedAt
    }))
}

async function getAllEvents(req, res) {
    try {
        const events = await EventsModel.getAllEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get events' });
    }
}

async function getEventById(req, res) {
  try {
    const event = await EventsModel.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get Event By Id Error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
}

async function createEvent(req, res) {
  try {
    const { title, description, datetime, youtube_link } = req.body;
    const urlParams = new URL(youtube_link).searchParams;
    const videoId = urlParams.get('v');
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube link' });
    }
    const { thumbnail, video_title, duration } = await fetchYoutubeVideoDetails(videoId);
    await EventsModel.createEvent({
      title,
      description,
      datetime,
      youtube_link,
      thumbnail,
      video_title,
      duration,
      created_by_admin_id: req.user.admin_id
    });
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

async function updateEvent(req, res) {
  try {
    const { title, description, datetime, youtube_link } = req.body;
    const urlParams = new URL(youtube_link).searchParams;
    const videoId = urlParams.get('v');
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube link' });
    }
    const { thumbnail, video_title, duration } = await fetchYoutubeVideoDetails(videoId);
    await EventsModel.updateEvent(req.params.id, {
      title,
      description,
      datetime,
      youtube_link,
      thumbnail,
      video_title,
      duration,
      created_by_admin_id: req.user.id
    });
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
}

async function deleteEvent(req, res) {
    try {
        await EventsModel.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

async function searchVideosHandler(req, res) {
    try {
        const keyword = req.query.q;
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        const videos = await searchYoutubeVideos(keyword);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search videos' });
    }
}

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    searchVideosHandler
};