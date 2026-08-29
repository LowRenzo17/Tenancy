import assert from 'node:assert/strict';
import test from 'node:test';
import { emitToUsers } from '../utils/realtime.js';

test('emitToUsers targets only unique authorized user rooms', () => {
  const emitted = [];
  const io = {
    to(room) {
      return {
        emit(eventName, payload) {
          emitted.push({ room, eventName, payload });
        },
      };
    },
  };

  const payload = { id: 'record-1' };
  emitToUsers(io, 'payment-updated', payload, ['owner-1', null, 'tenant-1', 'owner-1']);

  assert.deepEqual(emitted, [
    { room: 'user-owner-1', eventName: 'payment-updated', payload },
    { room: 'user-tenant-1', eventName: 'payment-updated', payload },
  ]);
});

test('emitToUsers does nothing without a socket server', () => {
  assert.doesNotThrow(() => emitToUsers(null, 'event', {}, ['user-1']));
});
