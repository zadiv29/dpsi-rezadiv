const db = require('../config');
const admin = require('firebase-admin'); // Add this line to require firebase-admin

const topUpBalance = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const currentBalance = userDoc.data().balance || 0;
    await userRef.update({ balance: currentBalance + amount });

    // Store balance history
    const historyRef = db.collection('history').doc();
    await historyRef.set({
      phoneNumber,
      type: 'topup',
      amount,
      timestamp: new Date()
    });

    res.status(200).send('Top-up successful');
  } catch (error) {
    res.status(500).send('Error topping up balance: ' + error.message);
  }
};

const transferBalance = async (req, res) => {
  try {
    const { fromPhoneNumber, toPhoneNumber, amount } = req.body;

    const fromUserRef = db.collection('users').doc(fromPhoneNumber);
    const toUserRef = db.collection('users').doc(toPhoneNumber);

    const fromUserDoc = await fromUserRef.get();
    const toUserDoc = await toUserRef.get();

    if (!fromUserDoc.exists || !toUserDoc.exists) {
      return res.status(404).send('One or both users not found');
    }

    const fromUserBalance = fromUserDoc.data().balance || 0;

    if (fromUserBalance < amount) {
      return res.status(400).send('Insufficient balance');
    }

    await db.runTransaction(async (t) => {
      t.update(fromUserRef, { balance: fromUserBalance - amount });
      const toUserBalance = toUserDoc.data().balance || 0;
      t.update(toUserRef, { balance: toUserBalance + amount });
    });

    // Store balance history
    const historyRef = db.collection('history').doc();
    await historyRef.set({
      fromPhoneNumber,
      toPhoneNumber,
      amount,
      type: 'transfer',
      timestamp: new Date()
    });

    res.status(200).send('Transfer successful');
  } catch (error) {
    res.status (500).send('Error transferring balance: ' + error.message);
  }
};

const messageAdmin = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    const messageRef = db.collection('messages').doc();
    await messageRef.set({
      phoneNumber,
      message,
      timestamp: new Date()
    });

    res.status(200).send('Message sent to admin');
  } catch (error) {
    res.status(500).send('Error sending message to admin: ' + error.message);
  }
};

const viewMessages = async (req, res) => {
  try {
    const messagesRef = db.collection('messages');
    const messagesSnapshot = await messagesRef.get();

    if (messagesSnapshot.empty) {
      return res.status(404).send('No messages found');
    }

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push(doc.data());
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send('Error retrieving messages: ' + error.message);
  }
};

const checkBalance = async (req, res) => {
  try {
    const { phoneNumber } = req.user;

    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const balance = userDoc.data().balance || 0;
    res.status(200).json({ balance });
  } catch (error) {
    res.status(500).send('Error checking balance: ' + error.message);
  }
};

module.exports = { topUpBalance, transferBalance, messageAdmin, viewMessages, checkBalance };
