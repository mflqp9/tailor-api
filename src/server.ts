import { dbConnect } from "./config/db.js";
import express,{Express} from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/routes.js";
// dotenv.config();

const app:Express = express();
app.use(cors());
app.use(express.json());
app.use(morgan("combined"))
// Routes

app.use("/api", apiRoutes);

// Connect to database and start server
dbConnect().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Export the Express app for Vercel serverless functions
export default app;

// app.listen( config.PORT,config.HOST, () => {
//   console.log(`🚀 Server is running on http://${config.HOST}:${config.PORT}`);
// });