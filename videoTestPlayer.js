import express from "express";
import bodyParser from "body-parser";
import fs from "node:fs";
import https from "https";

const app = express();
const port = 8000;

var movieList = [];

//const videoPath = `C:/Users/ritus/Downloads/Davinci Resolve 16 - Beginner to Hero Tutorial.mp4`;
const videoPath = `/home/pi/Davinci Resolve 16 - Beginner to Hero Tutorial.mp4`;
//const movieDir = "C:/Users/ritus/OneDrive/Documents/Web-Dev/Backend/Media-Streaming-App/Movies/";

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

readFiles();
const randomNumber = Math.floor(Math.random() * movieList.length);
//const videoPath = movieDir + movieList[randomNumber];
const movieTitle = movieList[randomNumber].slice(0, movieList[randomNumber].length - 4);
//const movieTitle = videoPath.slice(25, videoPath.length - 4);

function readFiles() {
    movieList = fs.readdirSync(movieDir);
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
  
app.get("/", (req, res) => { 
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Player</title>
            <style>
                body {
                    background-color: rgb(50, 50, 50);
                    display: flex;
                    flex-wrap: wrap;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    color: rgb(199, 199, 199);
                }
            </style>
        </head> 
        <body> 
            <video src="/videoplayer/stream" width="80%" controls>
                Your Browser does not support the video format!
            </video>
            <h2>${movieTitle}</h2>
        </body>
        </html>`);
}); 

app.get("/videoplayer/stream", (req, res) => {
    const range = req.headers.range;
    console.log(`Header.Range: ${range}`);
    const videoSize = fs.statSync(videoPath).size ;
    const chunkSize = 1 * 1e6;

    try {
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, videoSize - 1);
        const contentLength = end - start + 1; 
        
        const headers = { 
        "Content-Range": `bytes ${start}-${end}/${videoSize}`, 
        "Accept-Ranges": "bytes", 
        "Content-Length": contentLength, 
        "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);

        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);
    } catch (error) {
        console.log(error);
    } 
});

https.createServer(options, app).listen(port, (req, res) => {
    console.log(`Server is Listening on: ${port}`);
});
