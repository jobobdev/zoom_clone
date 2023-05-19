const socket = io(); //io function will automatically find the server that socket.io is running on => this connects the socket.io to the front-end

const myFace = document.getElementById("myFace");
const muteButton = document.getElementById("mute");
const cameraButton = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName = "";
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
    console.log(cameras);
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMute() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteButton.innerText = "Unmute";
    muted = true;
  } else {
    muteButton.innerText = "Mute";
    muted = false;
  }
}
function handleCameraOff() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraButton.innerText = "Camera Off";
    cameraOff = false;
  } else {
    cameraButton.innerText = "Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteButton.addEventListener("click", handleMute);
cameraButton.addEventListener("click", handleCameraOff);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form
const welcome = document.getElementById("welcom");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleRoomSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}
welcomeForm.addEventListener("submit", handleRoomSubmit);

// Socket Code

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
}); //runs on peer A, when B joins. it creates offer and sends it to the server

socket.on("offer", async (offer) => {
  console.log("Recieved offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setRemoteDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("Sent the answer");
}); // runs on peer B, when B receives the offer from the server. and created Answer for that.

socket.on("answer", async (answer) => {
  console.log("Recieved the answer");
  await myPeerConnection.setRemoteDescription(answer);
}); // on peer A, when the answer is sent from B trough the server.

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
} // putting my video and audio inside the RTC, so that it is shared thru the server.

function handleIce(data) {
  console.log("got icecandidate");
  console.log(data);
}
