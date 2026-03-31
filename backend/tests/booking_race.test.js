import request from 'supertest';
import app from '../server.js';

/**
 * PRODUCTION ARCHITECTURE END-TO-END CONCURRENCY VALIDATIONS
 * Testing suite to strictly verify the ACID mechanisms and WorkerAvailability 
 * intercepts injected via V6 components explicitly defeating double-booking bounds.
 */

describe('Booking Concurrency & Overlap Intersection Tests', () => {
    
    // Abstracting mock components mapping dynamic tokens.
    let customerToken, workerId;

    it('1. Booking exactly same worker twice simultaneously in overlapping time -> FAIL', async () => {
        const payload1 = { worker_id: workerId, start_time: '2027-04-01T10:00:00', end_time: '2027-04-01T12:00:00', description: 'Transaction Block A' };
        const payload2 = { worker_id: workerId, start_time: '2027-04-01T10:30:00', end_time: '2027-04-01T13:00:00', description: 'Transaction Block B' };
        
        const req1 = request(app).post('/api/bookings').set('Authorization', `Bearer ${customerToken}`).send(payload1);
        const req2 = request(app).post('/api/bookings').set('Authorization', `Bearer ${customerToken}`).send(payload2);
        
        const [res1, res2] = await Promise.all([req1, req2]);
        const statuses = [res1.status, res2.status];
        
        // Assert exclusive conflict resolution successfully decoupled simultaneous entries
        expect(statuses).toContain(201); // Only 1 evaluates safely bounds check
        expect(statuses).toContain(409); // Intersect rejects correctly
    });

    it('2. Booking in completely physically invalid or historical non-available block -> FAIL', async () => {
        const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${customerToken}`)
            .send({ worker_id: workerId, start_time: '2020-04-01T10:00:00', end_time: '2020-04-01T12:00:00', description: 'Past historical booking check' });
        
        // Expect exact explicit error trace handling rejecting logic blocks out of reality.
        expect(res.status).toBe(400); 
        expect(res.body.error).toMatch(/past/);
    });

    it('3. Allocating clear bounded logic in valid zone successfully locks -> SUCCESS', async () => {
        const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${customerToken}`)
            .send({ worker_id: workerId, start_time: '2027-05-01T08:00:00', end_time: '2027-05-01T10:00:00', description: 'Absolute locked placement instance' });
            
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });
});
