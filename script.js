console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let index=0;
let currFolder; 


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  index = 0;
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
    songUL.innerHTML="";
  for (const song of songs) {
    songUL.innerHTML += `<li>
                        <img src="icons/music.svg" alt="">
                            <div>
                                <div class="info">
                                ${decodeURIComponent(
                                  song.replaceAll("%20", " ")
                                )}
                                </div>
                                
                            </div>
                        <img src="icons/playsong.svg" style="filter: invert(1);";>

         </li>`;
  }
  // Attach eventlistener to songs
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").innerHTML);
      playMusic(e.querySelector(".info").innerHTML.trim());

      
    });
  });
   
}

function formatTime(seconds) {
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Ensure minutes and seconds are always two digits
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
    
  currentSong.src = `/${currFolder}/` + decodeURIComponent(track);
  if (!pause) {
    currentSong.play();
    play.src = "icons/pause.svg";
  }
  // Update the song info in the UI
  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";

  // Update the index of the current song
  index = songs.indexOf(track);
};

async function displayAlbums(){
    let a = await fetch(`/songs/`);

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors);
    for(let index = 0; index < array.length; index++) {
        const e = array[index];
        // Check if the anchor link points to a subfolder within "songs"
        if (e.href.includes("/songs") && e.href.split("/").slice(-1)[0] !== "songs") {
            let folder = e.href.split("/").slice(-2)[1]; // Get the folder name (cs or ncs)
            let jsonUrl = `/songs/${folder}/info.json`;


            try {
                let response = await fetch(jsonUrl); // Try to fetch the JSON file

                if (response.ok) { // Check if the fetch was successful
                    let json = await response.json();
                    console.log(`Folder: ${folder}`, json);
                    cardContainer.innerHTML = cardContainer.innerHTML+ 
                    `<div data-folder="${folder}" class="card">
                        <img src="/songs/${folder}/cover.jpg" alt="Happy Hits">
                        <div class="card-content">
                            <h2>${json.title}</h2>
                            <p>${json.description}</p>
                        </div>
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>`;

                    
                } else {
                    console.error(`JSON not found in folder: ${folder}`);
                }
                 // Add event listner to all cards
                 Array.from(document.getElementsByClassName("card")).forEach(e => {
                  e.addEventListener("click", async (item) => {
                    await getSongs(`songs/${item.currentTarget.dataset.folder}`); // Wait for songs to be fetched
                    index = 0; // Reset index to the first song in the new playlist
                    playMusic(songs[index]); // Play the first song
                  });
                });
            } catch (error) {
                console.error(`Error fetching JSON from ${jsonUrl}:`, error);
            }
        }
    };
}



async function main() {
  await getSongs("songs/Yes I Do");
  playMusic(songs[0], true);
    displayAlbums();
    
  //attach event listener to play
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "icons/pause.svg";
    } else {
      currentSong.pause();
      play.src = "icons/playsong.svg";
    }
  });

  // Event listener for time update (to update the progress bar)
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;

    const currentTime = currentSong.currentTime;
    const duration = currentSong.duration;

    if (!isNaN(currentTime) && !isNaN(duration) && duration > 0) {
      document.querySelector(".circle").style.left =
        (currentTime / duration) * 100 + "%";
    } else {
      console.log("Audio is not ready or duration is invalid.");
    }
  });

  currentSong.addEventListener("ended", () => {
    if (songs && songs.length > 0) { // Ensure songs array is defined and not empty
        if ((index + 1) < songs.length) {
            index++; // Move to the next song
        } else {
            index = 0; // Reset to the first song if at the end of the playlist
        }
        playMusic(songs[index]); // Play the next song
    } else {
        console.error("Songs array is not loaded or empty.");
    }
});
  //add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click",(e)=>{
    let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left=percent + "%";
    currentSong.currentTime= ((currentSong.duration)*percent)/100;
  })

   //Add event listeners to previous and Next
  //  index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

   next.addEventListener("click", () => {
    if (songs && songs.length > 0) { // Ensure songs array is defined and not empty
      if ((index + 1) < songs.length) {
        index++; // Move to the next song
        playMusic(songs[index]); // Play the next song
      } else {
        console.log("Already at the last song in the playlist.");
      }
    } else {
      console.error("Songs array is not loaded or empty.");
    }
  });
  
  previous.addEventListener("click", () => {
    if (songs && songs.length > 0) { // Ensure songs array is defined and not empty
      if ((index - 1) >= 0) {
        index--; // Move to the previous song
        playMusic(songs[index]); // Play the previous song
      } else {
        console.log("Already at the first song in the playlist.");
      }
    } else {
      console.error("Songs array is not loaded or empty.");
    }
  });

  //hamburger functioning on LEFT div
  document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left=0;
    document.querySelector(".left").style.width="400px";
  })

  // Add event listener to close button
  document.querySelector(".close-icon").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%";
  })

 

    // Add event Listener to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
    })

    // Add event Listener to Mute the Track
    document.querySelector(".volume-icon").addEventListener("click",(e)=>{
        console.log(e.target)
        let inp_range = document.querySelector(".range-input");
        if(currentSong.volume==0){
            currentSong.volume= 1;
            e.target.src="icons/volume.svg";
            inp_range.value=50;
        }else{
            currentSong.volume= 0;
            e.target.src="icons/mute.svg";
            inp_range.value=0; 
        }
    })
   
}

main();
