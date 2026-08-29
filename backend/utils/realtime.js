const userRoom = (userId) => `user-${userId}`;

/**
 * Deliver record changes only to users allowed to see the record. Route
 * handlers remain the source of truth; browsers must never broadcast records.
 */
export const emitToUsers = (io, eventName, payload, userIds) => {
  if (!io) return;

  const recipients = new Set(
    userIds
      .filter(Boolean)
      .map((userId) => userId.toString()),
  );

  recipients.forEach((userId) => io.to(userRoom(userId)).emit(eventName, payload));
};
