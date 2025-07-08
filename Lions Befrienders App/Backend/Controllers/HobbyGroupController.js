const {fetchGroupsWithGroupMemberCount} = require('../Models/HobbyGroupModel');

async function getHobbyGroups(req, res) {
    try {
        const groups = await fetchGroupsWithGroupMemberCount();
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching hobby groups:', error);
        res.status(500).json({ error: 'Failed to fetch hobby group' });
    }
}
module.exports = {
    getHobbyGroups
};