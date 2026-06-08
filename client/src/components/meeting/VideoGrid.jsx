import { VideoPlayer } from "./VideoPlayer.jsx";

/**
 * VideoGrid — lays out all participant video tiles responsively.
 *
 * Layout rules:
 * 1 participant  → full width
 * 2 participants → 2 columns
 * 3-4            → 2x2 grid
 * 5-6            → 3x2 grid
 * 7+             → 3+ columns auto-fill
 */
export function VideoGrid({ localStream, localUser, remoteStreams, audioEnabled, videoEnabled, isSharing }) {
  const remoteEntries = Array.from(remoteStreams.entries()); // [socketId, { stream, user, audioEnabled, videoEnabled }]
  const totalCount = 1 + remoteEntries.length;

  const gridClass =
    totalCount === 1 ? "grid-cols-1" :
    totalCount === 2 ? "grid-cols-2" :
    totalCount <= 4 ? "grid-cols-2" :
    totalCount <= 6 ? "grid-cols-3" :
    "grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`h-full grid ${gridClass} gap-2 p-2`}>
      {/* Local tile */}
      <VideoPlayer
        stream={localStream}
        participant={localUser}
        isSelf
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled && !isSharing}
      />

      {/* Remote tiles */}
      {remoteEntries.map(([socketId, { stream, user, audioEnabled: rAudio, videoEnabled: rVideo }]) => (
        <VideoPlayer
          key={socketId}
          stream={stream}
          participant={user}
          audioEnabled={rAudio !== false}
          videoEnabled={rVideo !== false}
        />
      ))}
    </div>
  );
}