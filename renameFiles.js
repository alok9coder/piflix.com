import fs from "node:fs"

const movieDir = "/home/pi/Movies/";
var movieList = [];
var prevMovieList = fs.readdirSync(movieDir);

readFiles();
printFileNames();
renameFiles();
console.log(prevMovieList);
readFiles();
printFileNames();


function readFiles() {
    movieList = fs.readdirSync(movieDir);
}

function printFileNames() {
    console.log(`\nMOVIES AVAILABLE AT THE MOMENT:\n`);

    for (let i = 0; i < movieList.length; i++) {
        console.log(movieList[i]);
    }
}

function renameFiles() {
    for (let i = 0; i < movieList.length; i++) {

        if(movieList[i].length > 45) {
            const tmpFormat = movieList[i].slice(movieList[i].length - 4);
            const tmpName = movieList[i].slice(0, 40);
            movieList = tmpName + tmpFormat;
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

