const HobbyGroupModel = require('../Models/HobbyGroupModel');
// yya
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
    const {
      group_name,
      description,
      meetup_date,
      meetup_time,
      meetup_location,
      created_by_admin_id
    } = req.body;

    const image_url = req.file ? req.file.filename : null;

    await HobbyGroupModel.insertGroup({
      group_name,
      description,
      image_url,
      meetup_date,
      meetup_time,
      meetup_location,
      created_by_admin_id: parseInt(created_by_admin_id)
    });

    res.status(201).json({ message: 'Hobby group created successfully' });
  } catch (error) {
    console.error('Error creating hobby group:', error);
    res.status(500).json({ error: 'Failed to create hobby group' });
  }
}

async function getHobbyGroupById(req, res){
    const group_id = parseInt(req.params.id);
    try {
        const group = await HobbyGroupModel.fetchGroupById(group_id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.status(200).json(group);
    }catch (error) {
        console.error('Error fetching group by ID:', error);
        res.status(500).json({ error: 'Failed to fetch group' });
    }
}
async function getGroupMember(req, res) {
  try {
    const groupId = parseInt(req.params.group_id); 
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group_id' });
    }

    const members = await HobbyGroupModel.fetchGroupMember(groupId); 
    res.json(members);
  } catch (err) {
    console.error("Error fetching group members:", err);
    res.status(500).json({ error: "Failed to fetch group members" });
  }
}


async function updateNickname(req, res) {
    try {
        const member_id = parseInt(req.params.member_id);
        const { nickname_in_group } = req.body;
        await HobbyGroupModel.updateNickname(member_id, nickname_in_group);
        res.status(200).json({ message: 'Nickname updated successfully' });
    } catch (error) {
        console.error('Error updating nickname:', error);
        res.status(500).json({ error: 'Failed to update nickname' });
    }
}

async function joinGroup(req, res) {
    try {
        const {group_id, user_id, nickname_in_group} = req.body;
        await HobbyGroupModel.joinGroup({group_id, user_id, nickname_in_group});
        res.status(200).json({ message: 'Successfully joined the group' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: 'Failed to join group' });
    }
}

async function leaveGroup(req, res) {
    try {
        const member_id = parseInt(req.params.member_id);
        if (isNaN(member_id)) {
            return res.status(400).json({ error: 'Invalid member_id' });
        }
        await HobbyGroupModel.leaveGroup(member_id);
        res.status(200).json({ message: 'Successfully left the group' });
    }catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ error: 'Failed to leave group' });
    }
}
module.exports = {
    getHobbyGroups,
    createHobbyGroup,
    getHobbyGroupById,
    getGroupMember,
    joinGroup,
    leaveGroup,
    updateNickname
}