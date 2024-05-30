import mongoose from "mongoose";

export default  function connectDB() {
    try {
        // console.log(process.env);
        mongoose.connect(process.env.MONGO_URI, {
        dbName: "mernTuition",
        }).
        then((c) => console.log(`DB connected to ${c.connection.name}`));
    } catch (error) {
        console.error("MongoDB connection failed", error);
    }
}