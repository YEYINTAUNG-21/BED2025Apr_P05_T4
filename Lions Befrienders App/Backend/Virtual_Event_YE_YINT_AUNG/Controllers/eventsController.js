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
    const event_id = req.params.id;
    const loggedInAdminId = req.user.admin_id;

    const existingEvent = await EventsModel.getEventById(event_id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.created_by_admin_id !== loggedInAdminId) {
      return res.status(403).json({ error: 'You can only update your own events' });
    }

    const { title, description, datetime, youtube_link } = req.body;
    const urlParams = new URL(youtube_link).searchParams;
    const videoId = urlParams.get('v');
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube link' });
    }

    const { thumbnail, video_title, duration } = await fetchYoutubeVideoDetails(videoId);
    await EventsModel.updateEvent(event_id, {
      title,
      description,
      datetime,
      youtube_link,
      thumbnail,
      video_title,
      duration,
      created_by_admin_id: loggedInAdminId // still updating with same ID
    });

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
}


async function deleteEvent(req, res) {
  try {
    const event_id = req.params.id;
    const loggedInAdminId = req.user.admin_id;

    const existingEvent = await EventsModel.getEventById(event_id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.created_by_admin_id !== loggedInAdminId) {
      return res.status(403).json({ error: 'You can only delete your own events' });
    }

    await EventsModel.deleteEvent(event_id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}



module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};