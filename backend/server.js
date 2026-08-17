const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Nạp biến môi trường .env TRƯỚC KHI kết nối DB
dotenv.config();

// Khởi tạo kết nối MongoDB
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});