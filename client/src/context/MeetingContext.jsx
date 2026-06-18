import { createContext, useContext, useState, useCallback, useRef } from "react";

const MeetingContext = createContext(null);

export function MeetingProvider({ children }) {
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [handRaisedUsers, setHandRaisedUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const notifIdRef = useRef(0);

  const startMeeting = useCallback((roomId, title) => {
    setActiveMeeting({ roomId, title, startedAt: Date.now() });
    setParticipants([]);
    setNotifications([]);
  }, []);

  const endMeeting = useCallback(() => {
    setActiveMeeting(null);
    setParticipants([]);
    setHandRaisedUsers(new Set());
    setNotifications([]);
  }, []);

  const addParticipant = useCallback((participant) => {
    setParticipants((prev) =>
      prev.find((p) => p._id === participant._id) ? prev : [...prev, participant]
    );
  }, []);

  const removeParticipant = useCallback((userId) => {
    setParticipants((prev) => prev.filter((p) => p._id !== userId));
    setHandRaisedUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
  }, []);

  const toggleHand = useCallback((userId) => {
    setHandRaisedUsers((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }, []);

  const addNotification = useCallback((message, type = "info") => {
    const id = ++notifIdRef.current;
    setNotifications((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <MeetingContext.Provider value={{
      activeMeeting, participants, handRaisedUsers, notifications,
      startMeeting, endMeeting, addParticipant, removeParticipant,
      toggleHand, addNotification, dismissNotification,
    }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeeting must be used within MeetingProvider");
  return ctx;
}

export default MeetingContext;
