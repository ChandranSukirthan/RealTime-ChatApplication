import express from "express";
import "dotenv/config"

const app = express()
const PORT = process.env.PORT;
app.listen(3000,() => console.log("Server is up and running on PORT:", PORT))