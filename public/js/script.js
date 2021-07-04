const socket = io("/")

const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement("video")

myVideo.muted = true

const peer = new Peer(undefined, {
    host: "/",
    port: "3001"
})

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    addVideoStream(myVideo, stream)

    peer.on("call", call => {
        console.log("Getting a call from other user")
        call.answer(stream)
        const video = document.createElement("video")
        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    
    socket.on("user-connected", userID => {
        connectToNewUser(userID, stream)
    })
})


socket.on('user-disconnected', userID => {
    if (peers[userID]) peers[userID].close()
})

peer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id)
})

function connectToNewUser(userID, stream) {
    const call = peer.call(userID, stream)
    const video = document.createElement('video')
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on("close", () => {
        video.remove()
    })
    peers[userID] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
        video.play()
    })
    videoGrid.append(video)
}

