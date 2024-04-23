import { app } from "./app";
import connectDB from "./utils/db";
require("dotenv").config();

app.listen(process.env.PORT, () => {
  connectDB()
  console.log(`Server is running on port ${process.env.PORT}`);
});
