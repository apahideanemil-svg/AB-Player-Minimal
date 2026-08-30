"use strict";

const audio = document.getElementById("audio");
const video = document.getElementById("video");

const mediaArea =
    document.querySelector(".media-area");

let media = audio;

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

const currentTimeDisplay =
    document.getElementById("currentTime");

const durationDisplay =
    document.getElementById("duration");

const playPauseButton =
    document.getElementById("playPauseButton");

const buttonA =
    document.getElementById("buttonA");

const buttonB =
    document.getElementById("buttonB");

const resetButton =
    document.getElementById("resetButton");

const back5Button =
    document.getElementById("back5Button");

const back1Button =
    document.getElementById("back1Button");

const forward1Button =
    document.getElementById("forward1Button");

const forward5Button =
    document.getElementById("forward5Button");


let pointA = null;
let pointB = null;

let loopEnabled = false;

let audioFileUrl = null;


function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "00:00.0";
    }

    const safeSeconds = Math.max(0, seconds);

    const minutes =
        Math.floor(safeSeconds / 60);

    const remainingSeconds =
        safeSeconds % 60;

    const formattedMinutes =
        String(minutes).padStart(2, "0");

    const formattedSeconds =
        remainingSeconds
            .toFixed(1)
            .padStart(4, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}


function fileIsLoaded() {
    return Boolean(media.src);
}

function updateABButtons() {
    buttonA.classList.toggle(
        "active",
        pointA !== null
    );

    buttonB.classList.toggle(
        "active",
        pointB !== null
    );
}

function resetAB() {
    pointA = null;
    pointB = null;
    loopEnabled = false;
    updateABButtons();
}


function jump(seconds) {
    if (!fileIsLoaded()) {
        return;
    }

    const newTime =
        media.currentTime + seconds;

    media.currentTime = Math.max(
        0,
        Math.min(
            media.duration || Infinity,
            newTime
        )
    );
}

function updateLoopState() {
    loopEnabled =
        pointA !== null &&
        pointB !== null &&
        pointA < pointB;

    updateABButtons();
}

fileInput.addEventListener(
    "change",
    function () {
        const selectedFile =
            fileInput.files[0];

        if (!selectedFile) {
            return;
        }

        if (audioFileUrl) {
            URL.revokeObjectURL(
                audioFileUrl
            );
        }

        audio.pause();
        video.pause();

        audio.removeAttribute("src");
        video.removeAttribute("src");

        audio.load();
        video.load();

        audioFileUrl =
            URL.createObjectURL(
                selectedFile
            );

        const isVideo =
            selectedFile.type.startsWith(
                "video/"
            );

        if (isVideo) {
            media = video;

            video.src = audioFileUrl;

            mediaArea.classList.add(
                "video-mode"
            );
        } else {
            media = audio;

            audio.src = audioFileUrl;

            mediaArea.classList.remove(
                "video-mode"
            );
        }

        fileName.textContent =
            selectedFile.name;

        resetAB();

        media.load();
        media.play();
    }
);


playPauseButton.addEventListener(
    "click",
    function () {
        if (!fileIsLoaded()) {
            fileInput.click();
            return;
        }

        if (media.paused) {
            media.play();
        } else {
            media.pause();
        }
    }
);


buttonA.addEventListener("click", function () {
    if (!fileIsLoaded()) {
        return;
    }

    if (pointA !== null) {
        pointA = null;
        updateLoopState();
        return;
    }

    if (
        pointB !== null &&
        media.currentTime >= pointB
    ) {
        return;
    }

    pointA = media.currentTime;

    updateLoopState();
});


buttonB.addEventListener("click", function () {
    if (!fileIsLoaded()) {
        return;
    }

    if (pointB !== null) {
        pointB = null;
        updateLoopState();
        return;
    }

    if (
        pointA !== null &&
        media.currentTime <= pointA
    ) {
        return;
    }

    pointB = media.currentTime;

    updateLoopState();
});

resetButton.addEventListener(
    "click",
    resetAB
);


back5Button.addEventListener(
    "click",
    function () {
        jump(-5);
    }
);


back1Button.addEventListener(
    "click",
    function () {
        jump(-1);
    }
);


forward1Button.addEventListener(
    "click",
    function () {
        jump(1);
    }
);


forward5Button.addEventListener(
    "click",
    function () {
        jump(5);
    }
);

function attachMediaEvents(element) {

    element.addEventListener(
        "play",
        function () {
            if (media === element) {
                playPauseButton.textContent =
                    "❚❚";
            }
        }
    );

    element.addEventListener(
        "pause",
        function () {
            if (media === element) {
                playPauseButton.textContent =
                    "▶";
            }
        }
    );

    element.addEventListener(
        "loadedmetadata",
        function () {
            if (media === element) {
                durationDisplay.textContent =
                    formatTime(
                        media.duration
                    );
            }
        }
    );

    element.addEventListener(
        "timeupdate",
        function () {
            if (media !== element) {
                return;
            }

            currentTimeDisplay.textContent =
                formatTime(
                    media.currentTime
                );

            if (
                loopEnabled &&
                pointA !== null &&
                pointB !== null &&
                media.currentTime >= pointB
            ) {
                media.currentTime =
                    pointA;
            }
        }
    );

   element.addEventListener(
    "ended",
    function () {
        if (media === element) {
            media.currentTime = 0;
            media.play();
        }
    }
);
}


attachMediaEvents(audio);
attachMediaEvents(video);


/* Tastatură */

document.addEventListener(
    "keydown",
    function (event) {
        if (event.repeat) {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (key === "a") {
            buttonA.click();
        }

        else if (key === "b") {
            buttonB.click();
        }

        else if (key === "r") {
            resetButton.click();
        }

        else if (key === "o") {
            fileInput.click();
        }

        else if (
            event.code === "Space"
        ) {
            event.preventDefault();

            playPauseButton.click();
        }

        else if (
            event.code === "ArrowLeft"
        ) {
            event.preventDefault();

            jump(-5);
        }

        else if (
            event.code === "ArrowRight"
        ) {
            event.preventDefault();

            jump(5);
        }
    }
);