import fs from "node:fs"

const movieDir = "/home/pi/Movies/";
//const movieDir = "C:/Users/ritus/OneDrive/Documents/Web-Dev/Backend/Media-Streaming-App/Movies/";


var movieList = [];
var prevMovieList = [];

readFiles();
printFileNames();
renameFiles();
console.log(prevMovieList);
readFiles();
printFileNames();


function readFiles() {
    movieList = fs.readdirSync(movieDir);
    prevMovieList = fs.readdirSync(movieDir);
}

function printFileNames() {
    console.log(`\nMOVIES AVAILABLE AT THE MOMENT:\n`);

    for (let i = 0; i < movieList.length; i++) {
        console.log(movieList[i]);
    }
    console.log(``);
}

function renameFiles() {
    console.log("");

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
    console.log("");

    readFiles();

    for (let i = 0; i < movieList.length; i++) {

        const tmpFormat = movieList[i].slice(movieList[i].length - 4);
        const tmpName = movieList[i].slice(0, movieList[i].length - 4);

        let strName = [];

        for (let j = 0; j < tmpName.length; j++) {
            if (((tmpName.charCodeAt(j) > 47) && (tmpName.charCodeAt(j) < 58)) || 
                ((tmpName.charCodeAt(j) > 64) && (tmpName.charCodeAt(j) < 94)) || 
                ((tmpName.charCodeAt(j) > 96) && (tmpName.charCodeAt(j) < 123))) {

                strName += tmpName.slice(j, j + 1);
            } else {
                strName += " ";
            }
        }

        movieList[i] = strName + tmpFormat;
        console.log(movieList[i]);
        fs.renameSync(movieDir + prevMovieList[i], movieDir + movieList[i]);
    }
    console.log("");

    readFiles();
    
    const titleLength = 60;
    for (let i = 0; i < movieList.length; i++) {
        
        if(movieList[i].length >= titleLength + 5) {
            const tmpFormat = movieList[i].slice(movieList[i].length - 4);
            const tmpName = movieList[i].slice(0, titleLength);
            movieList[i] = tmpName + tmpFormat;
            console.log(movieList[i]);
            fs.renameSync(movieDir + prevMovieList[i], movieDir + movieList[i]);
        }
    }
}

