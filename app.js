const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const multer = require('multer');
const cors = require('cors');
const  db  = require('./config'); // Require the config file
const app = express();
const router = express.Router();
const { authenticateToken, authorizeRole } = require('./middleware/authmiddleware');
const eWalletController = require('./controllers/ewalletcontroller');
const userController = require('./controllers/usercontroller');
const balanceHistoryController = require('./controllers/balancehistory');
// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Updated origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
dotenv.config();

// All routes here
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/topup', authenticateToken, authorizeRole(['user', 'admin']), eWalletController.topUpBalance);
router.post('/transfer', authenticateToken, authorizeRole(['user', 'admin']), eWalletController.transferBalance);
router.post('/messageAdmin', authenticateToken, authorizeRole(['user', 'admin']), eWalletController.messageAdmin);
router.get('/viewMessages', authenticateToken, authorizeRole(['admin']), eWalletController.viewMessages);
router.get('/checkBalance', authenticateToken, authorizeRole(['user', 'admin']), eWalletController.checkBalance);
router.get('/balanceHistory', authenticateToken, authorizeRole(['user', 'admin']), balanceHistoryController.getBalanceHistory);


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example route to demonstrate database connection
router.get('/test', async (req, res) => {
  try {
    const snapshot = await db.collection('testCollection').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.use('/api', router);