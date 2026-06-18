import { VideoPlayer } from "./VideoPlayer.jsx";

export function VideoCard({ stream, name, isSelf = false, isHost = false, micOn = true, camOn = true, isScreenShare = false, quality = "good", large = false }) {
  return (
    <VideoPlayer
      stream={stream}
      name={name}
      isSelf={isSelf}
      isHost={isHost}
      micOn={micOn}
      camOn={camOn}
      isScreenShare={isScreenShare}
      quality={quality}
      large={large}
    />
  );
}

export default VideoCard;
