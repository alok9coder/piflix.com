import express from "express";
import bodyParser from "body-parser";
import fs from "node:fs";
import * as formidable from "formidable";

const app = express();
const port = 4000;

var movieList = [];

//const videoPath = `C:/Users/ritus/Downloads/Davinci Resolve 16 - Beginner to Hero Tutorial.mp4`;
//const videoPath = `/home/pi/Davinci Resolve 16 - Beginner to Hero Tutorial.mp4`;
const movieDir = "D:/Media/";

readFiles();

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
            <title>Upload File</title>
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
            <h2>UPLOAD YOUR FILE HERE!</h2>
            <input id="fileupload" type="file" name="fileupload" />
            <button id="upload-button" onclick="uploadFile()"> Upload </button>
            
            <script>
                async function uploadFile() {
                    let formData = new FormData(); 
                    formData.append("fileupload", fileupload.files[0]);
                        await fetch('http://localhost:4000/upload', {
                        method: "POST", 
                        body: formData
                    }); 
                }
            </script>
        </body>
        </html>`);
}); 

app.post("/upload", (req, res) => {
  //Create an instance of the form object
  let form = new formidable.IncomingForm();

  //Process the file upload in Node
  form.parse(req, function (error, fields, file) {
    let filepath = file.fileupload[0].filepath;
    console.log(filepath);  
    let newpath = movieDir;
    newpath += file.fileupload[0].originalFilename;
    console.log(newpath);
    console.log(file);
    
      let start = 0;
      let end = 0;
      let contentLength = 0;
      const chunkSize = 1 * 1e6;
      //Copy the uploaded file to a custom folder
    start = file.fileupload[0]._writeStream.start;
    end = file.fileupload[0]._writeStream.pos;
    
      try {
          if (start > end) {
              start = end - chunkSize;
              end = Math.min(start + chunkSize, movieSize - 1);
              contentLength = end - start + 1;
          } else {
              start = Number(range.replace(/\D/g, ""));
              end = Math.min(start + chunkSize, movieSize - 1);
              contentLength = end - start + 1;
          }

          console.log("start ---> ", start);
          console.log("end ---> ", end);
      
          try {
              fs.createWriteStream(newpath, { start, end });
              // file written successfully
          } catch (err) {
              console.error(err);
          }
      } catch (error) {
                console.log(error);
      }
  });
});


app.listen(port, (req, res) => {
    console.log(`Server is Listening on: ${port}`);
});
