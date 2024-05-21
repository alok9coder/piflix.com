import express from "express";
import bodyParser from "body-parser";
import fs from "node:fs";
import https from "https";
import multer from "multer";

const app = express();
const port = 8000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//const movieDir = "/home/pi/Movies/";
//const movieDir = "C:/Users/ritus/OneDrive/Documents/Web-Dev/Backend/Media-Streaming-App/Movies/";
//const movieDir = "/media/pi/External Drive/Movies/";
//const movieDir = "/mnt/huge/Movies/";
const movieDir = "D:/Movies/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, movieDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

var movieNumb = 0;
var movieName = " ";
var videoFormat = " ";
var moviePath = " ";

var movieList = [];
var prevMovieList = [];

readFiles();
//printFileNames();
renameFiles();
//console.log(prevMovieList);
readFiles();
printFileNames();

/*********************/

app.get("/", (req, res) => {
    const randomNumber = Math.floor(Math.random() * (movieList.length - 5));

    readFiles();
    renameFiles();
    
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

app.post("/search", async (req, res) => {
    const searchText = req.body["search"];
    console.log("SEARCH INPUT:\t", searchText);

    const searchResults = await searchFiles(searchText);
    console.log("\nSEARCH RESULTS:\n", searchResults);
    res.render("search.ejs", { content: searchResults, pattern: searchText, });
});

app.post("/player", (req, res) => {
    const uniqueUserID = Math.floor(Math.random() * 1 * 1e9) + Math.floor(Math.random() * 1 * 1e9);

    const searchSelect = req.body["thumbnailSelected"];
    const IndexFound = movieList.findIndex((mov) => mov == searchSelect);
    movieNumb = parseInt(IndexFound);
    movieName = movieList[movieNumb];
    videoFormat = movieName.slice(movieName.length - 3);
    moviePath = movieDir + movieName; // movieName.mp4 or .mkv or .web
    console.log("Watch Movie ---> \t", moviePath);

    const data = {
        pageTitle : "piflix | Media Player",
        movieTitle : movieName,
        movieFormat: videoFormat,
        userID: uniqueUserID,
    };

    res.render("player.ejs", { content: data });

    var stream = new MovieStream(uniqueUserID, videoFormat, moviePath);
    stream.printStream();
    stream.createStream();
});

app.post("/download", (req, res) => {
    const uniqueDownloadID = Math.floor(Math.random() * 1 * 1e9) + Math.floor(Math.random() * 1 * 1e9);
    const downloadName = req.body.movieName;
    
    videoFormat = downloadName.slice(downloadName.length - 3);
    moviePath = movieDir + downloadName; // movieName.mp4 or .mkv or .web
    console.log("Download ---> \t", moviePath);

    res.redirect(`/download/${uniqueDownloadID}`); 

    var download = new DownloadStream(uniqueDownloadID, videoFormat, moviePath, downloadName);
    download.printStream();
    download.createStream();
});

app.get("/movies", (req, res) => {
    readFiles();
    renameFiles();

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

app.post("/upload/movie", upload.single("newFile"), (req, res) => {
    // UPLOAD function still needs to be developed.
    console.log(req.file);
    console.log(req.body);
    console.log(req.file.originalname);
    console.log(req.file.size);

    res.redirect("/movies");
});

/* */ // Uncomment the code below when using telebit to reroute the request to server running on your localhost at the desired port.
app.listen(port, () => {
    console.log(`Server is Listening on port: ${port}`);
});

/*   // Uncomment the code below when using server on a local machine and want to access through https:// or port-forwarding directly from your router's firewall.
https.createServer(options, app).listen(port, (req, res) => {
    console.log(`Server is Listening on port: ${port}`);
});
*/

class MovieStream {
    constructor(uniqueID, videoFormat, moviePath) {
        this.userID = uniqueID;
        this.videoFormat = videoFormat;
        this.moviePath = moviePath;
    }

    printStream() {
        console.log(this.userID);
        console.log(this.videoFormat);
        console.log(this.moviePath);
    }

    createStream() {
        app.get(`/mediastream/${this.userID}`, (req, res) => {
            let start = 0;
            let end = 0;
            let contentLength = 0;
            const range = req.headers.range;
            const movieSize = fs.statSync(this.moviePath).size;
            const chunkSize = 1 * 1e6;
            //console.log(req.headers);
            //console.log(req.headers.range);
        
            try {
                if (start > end) {
                    start = end - chunkSize;
                    end = Math.min(start + chunkSize, movieSize - 1 );
                    contentLength = end - start + 1;
                } else {
                    start = Number(range.replace(/\D/g, ""));
                    end = Math.min(start + chunkSize, movieSize - 1 );
                    contentLength = end - start + 1;
                }
            
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${movieSize}`,
                    "Accept-Range": "bytes",
                    "Content-Length": contentLength,
                    "Content-Type": `video/${this.videoFormat}`,
                };
                
                res.writeHead(206, headers);
        
                const stream = fs.createReadStream(this.moviePath, { start, end });
                stream.pipe(res); 
            } catch (error) {
                console.log(error);
            }
        });
    }
}
class DownloadStream {
    constructor(uniqueDownloadID, videoFormat, moviePath, downloadName) {
        this.downloadID = uniqueDownloadID;
        this.videoFormat = videoFormat;
        this.moviePath = moviePath;
        this.downloadName = downloadName;
    }

    printStream() {
        console.log(this.downloadID);
        console.log(this.videoFormat);
        console.log(this.moviePath);
        console.log(this.downloadName);
    }

    createStream() {
        app.get(`/download/${this.downloadID}`, (req, res) => {
            try {
                const downloadStream = fs.createReadStream(this.moviePath);
                res.setHeader("Content-Disposition", `attachment;filename=${this.downloadName}`);
                res.setHeader("Content-Type", `video/${this.videoFormat}`);
                downloadStream.on("data", (chunk) => res.write(chunk));
                downloadStream.on("end", () => res.end());
                downloadStream.on("close", () => console.log(`Download Completed for file: ${this.moviePath}`));
            } catch (error) {
                console.log(error);
            }
        });
    }
}

function readFiles() {
    try {
        movieList = fs.readdirSync(movieDir);
        prevMovieList = fs.readdirSync(movieDir);
    } catch (error) {
        console.log(error);
    }
}

function printFileNames() {
    console.log(`\nMOVIES AVAILABLE AT THE MOMENT:\n`);

    for (let i = 0; i < movieList.length; i++) {
        console.log(movieList[i]);
    }
    console.log(``);
}

function renameFiles() {
    //console.log("");

    for (let i = 0; i < movieList.length; i++) {
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
    //console.log("");

    readFiles();

    for (let i = 0; i < movieList.length; i++) {
        const tmpFormat = movieList[i].slice(movieList[i].length - 4);
        const tmpName = movieList[i].slice(0, movieList[i].length - 4);

        let strName = [];

        for (let j = 0; j < tmpName.length; j++) {
            if (((tmpName.charCodeAt(j) > 47) && (tmpName.charCodeAt(j) < 58)) || 
                ((tmpName.charCodeAt(j) > 64) && (tmpName.charCodeAt(j) < 94)) || 
                ((tmpName.charCodeAt(j) > 96) && (tmpName.charCodeAt(j) < 123)) ||
                (tmpName.charCodeAt(j) === 34) ||
                (tmpName.charCodeAt(j) === 39)) {

                strName += tmpName.slice(j, j + 1);

            } else if ((tmpName.charCodeAt(j) === 32) && 
                (tmpName.charCodeAt(j - 1) === 32)) {
                
                strName += "";
            } else {
                
                strName += " ";
            }
        }
        movieList[i] = strName + tmpFormat;
        //console.log(movieList[i]);
        fs.renameSync(movieDir + prevMovieList[i], movieDir + movieList[i]);
    }
    readFiles();
}

async function searchFiles(name) {
    let result = [];
    readFiles();
    
    let pattern = [];

    for (let i = 0; i < name.length; i++) {
        if (name.charCodeAt(i) !== 32) {
            pattern += name[i].toLowerCase();
        }
    }
    console.log("pattern: ", pattern);
    const patternLength = pattern.length;
    //console.log("patternLength: ", patternLength);

    // New Search Algorithm.
    for (let i = 0; i < movieList.length; i++) {
        let movieName = [];

        for (let j = 0; j < movieList[i].length; j++) {
            if (movieList[i].charCodeAt(j) !== 32) {
                movieName += movieList[i][j].toLowerCase();
            }
        }

        //console.log("movieName: ", movieName);

        for (let k = 0; k < (movieName.length - patternLength - 4); k++) {
            let strcomp = [];

            for (let l = 0; l < patternLength; l++) {
                strcomp += movieName[k + l]
            }

            if (pattern === strcomp) {
                if (result.length <= 0) {
                    result.push(movieList[i]);  console.log("A | movieName: ", movieName);
                } else if (result.findIndex((string) => string === movieList[i]) < 0) {
                    result.push(movieList[i]);  console.log("B | movieName: ", movieName);
                } else {
                    strcomp = [];
                }
            }
        }
    }
    
    return result;
}

