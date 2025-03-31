import connectDB from "./db/index.js"
import dotenv from "dotenv"
dotenv.config()
import app from "./app.js"
connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, ()=> {
        console.log(`server is running  at port: ${process.env.PORT}`);
        
    })
})
.catch((error) => {
    console.log(`Db connection failed ${error}`)
})

