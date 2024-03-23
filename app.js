import express from "express";
import bodyParser from "body-parser";
import fs from "node:fs";
import https from "https";

const app = express();
const port = 8000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const movieDir = "/home/pi/Movies/";
//const movieDir = "C:/Users/ritus/OneDrive/Documents/Web-Dev/Backend/Media-Streaming-App/Movies/";

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

var movieNumb = 0;
var movieName = " ";
var videoFormat = " ";
var moviePath = " ";

var globalRandomNumber = 0;

var movieList = [];
var prevMovieList= fs.readdirSync(movieDir);

readFiles();
//printFileNames();
renameFiles();
//console.log(prevMovieList);
readFiles();
printFileNames();

/*********************/

function readFiles() {
    movieList = fs.readdirSync(movieDir);
}

function printFileNames() {
    console.log(`\nMOVIES AVAILABLE AT THE MOMENT:\n`);

    for (let i = 0; i < movieList.length; i++) {
        console.log(movieList[i]);
    }
    console.log(``);
}

function renameFiles() {
    for (let i = 0; i < movieList.length; i++) {
        
        if(movieList[i].length >= 35) {
            const tmpFormat = movieList[i].slice(movieList[i].length - 4);
            const tmpName = movieList[i].slice(0, 30);
            movieList[i] = tmpName + tmpFormat;
            console.log(movieList[i]);
            fs.renameSync(movieDir + prevMovieList[i], movieDir + movieList[i]);
        }

        if (movieList[i][0] === "w" &&
            movieList[i][1] === "w" &&
            movieList[i][2] === "w" &&
            movieList[i][3] === ".") {
            console.log(movieList[i]);
            for (let j = 0; !(movieList[i][j] === "-"); j++) {
                if (movieList[i][j + 1] === "-") {
                    movieList[i] = movieList[i].slice(j + 3);
                    fs.renameSync(movieDir + prevMovieList[i], movieDir + movieList[i]);
                    break;
                }
            }
        }
    }
}

app.get("/", (req, res) => {
    const randomNumber = Math.floor(Math.random() * (movieList.length - 5));
    globalRandomNumber = randomNumber;
    const data = {
        pageTitle : "piflix",
        MovieTitle1 : movieList[randomNumber + 0],
        MovieTitle2 : movieList[randomNumber + 1],
        MovieTitle3 : movieList[randomNumber + 2],
        MovieTitle4 : movieList[randomNumber + 3],
        MovieTitle5 : movieList[randomNumber + 4],
    };
    res.render("index.ejs", { content: data });
    //console.log(data);
});

app.get("/home", (req, res) => {
    res.redirect("/");
});

app.post("/player", (req, res) => {
    movieNumb = Number(req.body["thumbnailSelected"]);
    console.log(movieNumb);
    movieName = movieList[globalRandomNumber + movieNumb];
    console.log(movieName);
    videoFormat = movieName.slice(movieName.length - 3);
    console.log(videoFormat);
    moviePath = movieDir + movieName; // movieName.mp4 or .mkv or .web
    console.log(moviePath);

    const data = {
        pageTitle : "piflix | Media Player",
        movieTitle : movieName,
        movieFormat: videoFormat,
    };

    res.render("player.ejs", { content: data });
});

app.post("/anotherplayer", (req, res) => {
    movieNumb = Number(req.body["thumbnailSelected"]);
    movieName = movieList[movieNumb];
    videoFormat = movieName.slice(movieName.length - 3);
    moviePath = movieDir + movieName; // movieName.mp4 or .mkv or .web
    console.log(moviePath);

    const data = {
        pageTitle : "piflix | Media Player",
        movieTitle : movieName,
        movieFormat: videoFormat,
    };

    res.render("player.ejs", { content: data });
});

app.get("/mediastream", (req, res) => {
    const range = req.headers.range;
    const movieSize = fs.statSync(moviePath).size;
    const chunkSize = 1 * 1e6;

    try {
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, movieSize -1 );
        const contentLength = end - start + 1;
    
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${movieSize}`,
            "Accept-Range": "bytes",
            "Content-Length": contentLength,
            "Content-Type": `video/${videoFormat}`,
        };
     
        res.writeHead(206, headers);

        const stream = fs.createReadStream(moviePath, { start, end });
        stream.pipe(res); 
    } catch (error) {
        console.log(error);
    }
});

app.get("/movies", (req, res) => {
    const data = {
        pageTitle : "piflix | Movies",
        MovieList : movieList,
    };
    res.render("movies.ejs", { content: data });
});

app.get("/upload", (req, res) => {
    const data = {
        pageTitle : "piflix | Upload New Movie",
        MovieList : movieList,
    };
    res.render("upload.ejs", { content: data });
});

https.createServer(options, app).listen(port, (req, res) => {
    console.log(`Server is Listening on port: ${port}`);
});


