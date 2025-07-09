const HobbyGroupModel = require('../Models/HobbyGroupModel');

async function getHobbyGroups(req, res) {
    try {
        const groups = await HobbyGroupModel.fetchGroupsWithGroupMemberCount();
          console.log('Fetched groups from DB:', groups);
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching hobby groups:', error);
        res.status(500).json({ error: 'Failed to fetch hobby group' });
    }
}
async function createHobbyGroup(req, res) {
    try {
        const {group_name, description, meetup_date, meetup_time, meetup_location, created_by_admin_id} = req.body;
        const admin_id = 2; // for testing 
        // const admin_id = req.user.admin_id;
        const image_url = req.file ? req.file.filename : null;
        await HobbyGroupModel.insertGroup({
            group_name,
            description,
            image_url,
            meetup_date,
            meetup_time,
            meetup_location,
            created_by_admin_id: admin_id
        });
        res.status(201).json({ message: 'Hobby group created successfully' });
    }catch (error) {
        console.error('Error creating hobby group:', error);
        res.status(500).json({ error: 'Failed to create hobby group' });
    }
}
module.exports = {
    getHobbyGroups,
    createHobbyGroup
}