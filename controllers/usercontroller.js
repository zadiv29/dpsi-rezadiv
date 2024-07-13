const db = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { phoneNumber, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).send('User already exists');
    }

    await userRef.set({
      phoneNumber,
      password: hashedPassword,
      role
    });

    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ phoneNumber: user.phoneNumber, role: user.role }, 'adeliatres', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
};

module.exports = { registerUser, loginUser };
