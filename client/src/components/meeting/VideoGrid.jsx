import { VideoPlayer } from "./VideoPlayer.jsx";

export function VideoGrid({
  localStream,
  remoteStreams,
  participants,
  currentUser,
  connectionQualities = {},
  sharing = false,
  screenStream = null,
}) {
  const remoteStreamEntries = Object.entries(remoteStreams);
  const totalCount = 1 + remoteStreamEntries.length;

  const gridClass =
    totalCount === 1 ? "grid-cols-1" :
    totalCount === 2 ? "grid-cols-2" :
    totalCount <= 4 ? "grid-cols-2" :
    totalCount <= 6 ? "grid-cols-3" :
    "grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`h-full grid ${gridClass} gap-2 p-2`}>
      <VideoPlayer
        stream={sharing ? screenStream : localStream}
        name={currentUser?.name || "You"}
        isSelf={true}
        isHost={currentUser?.isHost}
        isScreenShare={sharing}
      />

      {remoteStreamEntries.map(([socketId, stream]) => {
        const participant = participants.find((p) => p.socketId === socketId) || {};
        const quality = connectionQualities[socketId] || "good";

        return (
          <VideoPlayer
            key={socketId}
            stream={stream}
            name={participant.name || "Unknown"}
            isSelf={false}
            isHost={participant.isHost}
            quality={quality}
          />
        );
      })}
    </div>
  );
}