
var time = 0;
const d = new Date();

document.getElementById("uploadbutton").onclick(() => {
    startTimer();
    if (time > 0) {
        if ((d.getTime() - time) > 200) {
            uploadPopUp();
            time = 0;
        }
    }

});

document.getElementById("downloadbutton").onclick(() => {
    startTimer();        
    if (time > 0) {
        if ((d.getTime() - time) > 200) {
            downloadPopUp();
            time = 0;
        }
    }
});

function startTimer() {
    time = d.getTime();
}

function uploadPopUp () {
    alert(`Your File is Uploading!
        Please Do Not Leave This Page!
        Click OK to Continue.`);
}

function downloadPopUp () {
    alert('Your Download Will Start Shortly!');
}

