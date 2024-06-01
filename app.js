import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './utils/database.js';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.js';
import studentRoutes from './routes/student.js';
import teacherRoutes from './routes/teacher.js';
import adminRoutes from './routes/admin.js';
import tuitionRoutes from './routes/tuition.js';
import batchRoutes from './routes/batch.js';

// to use .env file
config();

// connect to database
connectDB();

// initialize express in app
const app = express();

//  urlencoded to parse the body of request (client sends data to the server as HTML form or URL encoded) --- using json to parse the body of request (client sends data to the server as JSON), ---- cors to allow cross-origin requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// using the userRoutes
app.use('/api/user', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tuition', tuitionRoutes);
app.use('/api/batch', batchRoutes);

// listen to the port
app.listen(process.env.PORT, ()=> {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
