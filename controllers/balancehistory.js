const db = require('../config');

const getBalanceHistory = async (req, res) => {
  try {
    const { phoneNumber } = req.user;

    const historyRef = db.collection('history').where('phoneNumber', '==', phoneNumber);
    const historySnapshot = await historyRef.get();

    const history = [];
    historySnapshot.forEach(doc => {
      history.push(doc.data());
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).send('Error retrieving balance history: ' + error.message);
  }
};

module.exports = { getBalanceHistory };
