const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const Group = require("../Models/group");
const  {authMiddleware,isAdmin}  = require("../Middleware/Auth");

router.get('/groups/:groupId', async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId).populate('members');;
  if (group) {
    res.json(group);
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});
router.get('/groups',authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find().populate('members');
    res.json({groups ,userId:req.user.id});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});



router.post('/groups', authMiddleware,isAdmin, async (req, res) => {
    try {
      const group = await Group.create(req.body);
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create group' });
    }
  });
  
  router.put('/groups/:groupId/addMember', authMiddleware, isAdmin, async (req, res) => {
    try {
      const group = await Group.findByIdAndUpdate(
        req.params.groupId,
        { $push: { members: req.body.userId } },
        { new: true }
      ).populate('members');
  
      // Emit a notification event to the added user
      const addedUser = await User.findById(req.body.userId);
      const io = req.app.get("io");
      if (addedUser && addedUser.socketId) {
        io.to(addedUser.socketId).emit("userAddedToGroup", {
          groupId: req.params.groupId,
          groupName: group.name,
        });
      }
  
      res.json(group);
    } catch (error) {
      res.status(400).json({ error: 'Failed to add member' });
    }
  });
  
  router.post('/groups/:groupId/sendMessage', authMiddleware, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const {  text } = req.body;
  const senderUserId = req.user.id;
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      group.messages.push({ sender: senderUserId, text });
      await group.save();
  
      const io = req.app.get("io");
     
      io.emit("groupMessage", {
        groupId: groupId, 
        sender: senderUserId,
        senderName: req.user.full_name,
        text,
      });
  
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message'});
      console.log(error)
    }
  });
  router.get('/groups/:groupId/messages', async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const group = await Group.findById(groupId).populate("messages.sender");
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      res.json({ messages: group.messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch group messages' });
      console.log(error)
    }
  });

  router.post('/chat/:id/sendMessage', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const senderUserId = req.user.id;

      const receiverUser = await User.findById(id);
  
      if (!receiverUser) {
        return res.status(404).json({ message: 'Receiver user not found' });
      }
  
     
      const message = {
        sender: senderUserId,
        text,
      };
  
    
      await User.findByIdAndUpdate(senderUserId, { $push: { messages: message } });
      await User.findByIdAndUpdate(id, { $push: { messages: message } });
  
    
      const io = req.app.get("io");
      console.log(`id:${receiverUser.socketId}`)
      if (receiverUser.socketId) {
        io.to(receiverUser.socketId).emit("userMessage", {
          sender: senderUserId,
          senderName: req.user.full_name,
          text,
        });
      }
  
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
      console.log(error);
    }
  });
  

module.exports = router;
