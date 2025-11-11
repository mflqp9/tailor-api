import express,{Express} from "express";
import morgan from "morgan";
import cors from "cors";
import config from "./config/environment.js"
import { dbConnected } from "./config/database.js";
import router from "./routes/routes.js";
const app:Express = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(cors());
dbConnected(); //Connect to your mongodb database if !node_env="development"
 
app.use("/",router);

const node_env= config.NODE_ENV


if(node_env=="development"){
    app.listen(config.PORT,config.HOST,()=>{
        console.log(`server is running on http://${config.HOST}:${config.PORT}`);
    })
}


export default app;