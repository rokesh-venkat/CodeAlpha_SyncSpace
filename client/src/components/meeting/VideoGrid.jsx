import { VideoPlayer } from "./VideoPlayer.jsx";

export function VideoGrid({ localStream, remoteStreams, participants, currentUser, connectionQualities = {}, sharing = false, screenStream = null }) {
  const remoteEntries = Object.entries(remoteStreams);
  const totalCount = 1 + remoteEntries.length;

  const gridClass =
    totalCount === 1 ? "grid-cols-1" :
    totalCount === 2 ? "grid-cols-1 sm:grid-cols-2" :
    totalCount <= 4 ? "grid-cols-2" :
    totalCount <= 6 ? "grid-cols-3" :
    "grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`h-full grid ${gridClass} gap-2`}>
      <VideoPlayer
        stream={sharing ? screenStream : localStream}
        name={currentUser?.name || "You"}
        isSelf={true}
        isHost={currentUser?.isHost}
        isScreenShare={sharing}
        large={totalCount === 1}
      />

      {remoteEntries.map(([socketId, entry]) => {
        const streamObj = entry?.stream ?? entry;
        const userId = entry?.userId;
        const remoteName = entry?.name;
        const participant = participants.find((p) => p._id === userId) || {};
        const quality = connectionQualities[socketId] || "good";

        return (
          <VideoPlayer
            key={socketId}
            stream={streamObj}
            name={remoteName || participant.name || "Guest"}
            isSelf={false}
            isHost={participant.isHost}
            micOn={participant.micOn !== false}
            camOn={participant.camOn !== false}
            quality={quality}
            large={totalCount <= 2}
          />
        );
      })}
    </div>
  );
}
