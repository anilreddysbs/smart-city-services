import bcrypt from 'bcryptjs';
import pool from './database.js';

const workerCategories = [
  'Electrician',
  'Plumber',
  'Painter',
  'Construction Worker',
  'Maintenance Worker'
];

const workerLocations = [
  'Pydiparru',
  'Velpuru',
  'Peravali',
  'Duvva',
  'Tetali',
  'Relangi',
  'Iragavaram',
  'Ajjaram',
  'Siddhantam',
  'Kavalipuram'
];

const customerLocations = [
  'Attili',
  'Manchili',
  'Maruteru',
  'Penugonda',
  'Aravalli',
  'Undi',
  'Palakollu',
  'Pippara',
  'Vadapalli',
  'Achanta'
];

const firstNames = ['Ravi', 'Suresh', 'Anitha', 'Lakshmi', 'Kiran', 'Teja', 'Divya', 'Sai', 'Harsha', 'Madhu'];
const workerReviewPool = [
  'Very professional and arrived on time.',
  'Work quality was excellent and clean.',
  'Quick fix, polite behavior, recommended.',
  'Solved the issue in one visit.',
  'Good communication and fair pricing.',
  'Reliable worker, will book again.'
];
const subscriptionTypes = ['Monthly', 'Quarterly', 'Half-Yearly'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

async function seedTempProfiles() {
  const defaultPassword = process.argv[2] || 'Temp@12345';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const client = await pool.connect();

  let insertedWorkers = 0;
  let insertedCustomers = 0;
  let insertedBookings = 0;
  let insertedRatings = 0;
  let insertedPosts = 0;
  let insertedAlerts = 0;
  let insertedSubscriptions = 0;

  try {
    await client.query('BEGIN');

    // Clean old temp seed data first to avoid duplicates across re-runs.
    // Deleting temp users cascades to workers/customers, bookings, ratings,
    // job history, certifications, alerts, subscriptions, and community posts.
    await client.query(
      `DELETE FROM Users
       WHERE email LIKE 'temp.worker%@smartcity.local'
          OR email LIKE 'temp.customer%@smartcity.local'`
    );

    // Remove seeded analytics rows tied to the temporary location pool.
    await client.query(
      `DELETE FROM service_demand_stats
       WHERE service_category = ANY($1::text[])
         AND location = ANY($2::text[])`,
      [workerCategories, [...workerLocations, ...customerLocations]]
    );

    // Ensure all core services exist with stable IDs.
    for (const serviceName of workerCategories) {
      await client.query(
        `INSERT INTO services (service_name)
         VALUES ($1)
         ON CONFLICT DO NOTHING`,
        [serviceName]
      );
    }

    for (let i = 0; i < workerLocations.length; i += 1) {
      const idx = i + 1;
      const name = `${firstNames[i]} Worker ${idx}`;
      const email = `temp.worker${idx}@smartcity.local`;
      const phone = `9000001${String(idx).padStart(3, '0')}`;
      const role = 'Worker';
      const category = workerCategories[i % workerCategories.length];
      const experience = randInt(2, 12);
      const location = workerLocations[i];
      const latitude = randFloat(16.35, 16.85, 8);
      const longitude = randFloat(81.35, 81.95, 8);

      const userInsert = await client.query(
        `INSERT INTO Users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, phone, passwordHash, role]
      );

      let userId;
      if (userInsert.rows.length > 0) {
        userId = userInsert.rows[0].id;
        insertedWorkers += 1;
      } else {
        const existing = await client.query('SELECT id FROM Users WHERE email = $1', [email]);
        userId = existing.rows[0].id;
      }

      await client.query(
        `INSERT INTO Workers (user_id, category, experience, location, verification_status, latitude, longitude, trust_score, total_jobs, completion_rate, disputes)
         VALUES ($1, $2, $3, $4, 'Verified', $5, $6, $7, $8, $9, $10)
         ON CONFLICT (user_id) DO UPDATE
         SET category = EXCLUDED.category,
             experience = EXCLUDED.experience,
             location = EXCLUDED.location,
             verification_status = EXCLUDED.verification_status,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude,
             trust_score = EXCLUDED.trust_score,
             total_jobs = EXCLUDED.total_jobs,
             completion_rate = EXCLUDED.completion_rate,
             disputes = EXCLUDED.disputes`,
        [
          userId,
          category,
          experience,
          location,
          latitude,
          longitude,
          randFloat(65, 95, 2),
          randInt(8, 45),
          randFloat(82, 99, 2),
          randInt(0, 3)
        ]
      );

    }

    for (let i = 0; i < customerLocations.length; i += 1) {
      const idx = i + 1;
      const name = `${firstNames[(i + 3) % firstNames.length]} Customer ${idx}`;
      const email = `temp.customer${idx}@smartcity.local`;
      const phone = `9000002${String(idx).padStart(3, '0')}`;
      const role = 'Customer';
      const location = customerLocations[i];
      const latitude = randFloat(16.35, 16.85, 8);
      const longitude = randFloat(81.35, 81.95, 8);

      const userInsert = await client.query(
        `INSERT INTO Users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, phone, passwordHash, role]
      );

      let userId;
      if (userInsert.rows.length > 0) {
        userId = userInsert.rows[0].id;
        insertedCustomers += 1;
      } else {
        const existing = await client.query('SELECT id FROM Users WHERE email = $1', [email]);
        userId = existing.rows[0].id;
      }

      await client.query(
        `INSERT INTO Customers (user_id, location, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET location = EXCLUDED.location,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude`,
        [userId, location, latitude, longitude]
      );
    }

    const workersRes = await client.query(`
      SELECT w.id, w.category, w.user_id, u.name
      FROM Workers w
      JOIN Users u ON u.id = w.user_id
      WHERE u.email LIKE 'temp.worker%@smartcity.local'
      ORDER BY w.id
    `);
    const customersRes = await client.query(`
      SELECT c.id, c.user_id, u.name
      FROM Customers c
      JOIN Users u ON u.id = c.user_id
      WHERE u.email LIKE 'temp.customer%@smartcity.local'
      ORDER BY c.id
    `);
    const servicesRes = await client.query('SELECT id, service_name FROM services');
    const serviceMap = new Map(servicesRes.rows.map((s) => [s.service_name, s.id]));

    // Booking + rating + job_history sample data.
    for (const customer of customersRes.rows) {
      const bookingCount = randInt(2, 4);
      for (let i = 0; i < bookingCount; i += 1) {
        const worker = pick(workersRes.rows);
        const serviceId = serviceMap.get(worker.category) || servicesRes.rows[0]?.id || 1;
        const start = new Date(Date.now() - randInt(1, 20) * 24 * 60 * 60 * 1000);
        start.setHours(randInt(8, 17), 0, 0, 0);
        const end = new Date(start.getTime() + randInt(1, 3) * 60 * 60 * 1000);
        const status = Math.random() < 0.7 ? 'Completed' : (Math.random() < 0.5 ? 'Accepted' : 'Pending');

        const bookingInsert = await client.query(
          `INSERT INTO Bookings (customer_id, worker_id, service_id, description, booking_date, start_time, end_time, status)
           VALUES ($1, $2, $3, $4, NOW() - ($5 || ' days')::interval, $6, $7, $8)
           RETURNING id`,
          [
            customer.id,
            worker.id,
            serviceId,
            `${worker.category} service request at ${pick(customerLocations)}.`,
            randInt(1, 20),
            start,
            end,
            status
          ]
        );
        insertedBookings += 1;
        const bookingId = bookingInsert.rows[0].id;

        if (status === 'Completed') {
          const rating = randInt(3, 5);
          const review = pick(workerReviewPool);

          await client.query(
            `INSERT INTO Ratings (booking_id, rating, review)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [bookingId, rating, review]
          );
          insertedRatings += 1;

          await client.query(
            `INSERT INTO job_history (worker_id, booking_id, service_type, rating)
             VALUES ($1, $2, $3, $4)`,
            [worker.id, bookingId, worker.category, rating]
          );
        }
      }
    }

    // Worker-level rollups to make dashboards meaningful.
    for (const worker of workersRes.rows) {
      const metricsRes = await client.query(
        `SELECT
           COUNT(*) FILTER (WHERE b.status = 'Completed') AS completed_jobs,
           COUNT(*) FILTER (WHERE b.status <> 'Pending') AS accepted_jobs,
           COALESCE(AVG(r.rating), 0) AS avg_rating
         FROM Bookings b
         LEFT JOIN Ratings r ON r.booking_id = b.id
         WHERE b.worker_id = $1`,
        [worker.id]
      );
      const m = metricsRes.rows[0];
      const completedJobs = Number(m.completed_jobs || 0);
      const acceptedJobs = Number(m.accepted_jobs || 0);
      const avgRating = Number(m.avg_rating || 0);
      const completionRate = acceptedJobs === 0 ? 100 : (completedJobs / acceptedJobs) * 100;
      const trustScore = Math.min(100, Math.max(40, (avgRating * 18) + (completionRate * 0.28)));

      await client.query(
        `UPDATE Workers
         SET total_jobs = $1, completion_rate = $2, trust_score = $3, disputes = $4
         WHERE id = $5`,
        [completedJobs, Number(completionRate.toFixed(2)), Number(trustScore.toFixed(2)), randInt(0, 2), worker.id]
      );

      await client.query(
        `INSERT INTO worker_performance (worker_id, total_jobs, average_rating, monthly_jobs, trust_score)
         VALUES ($1, $2, $3, $4, $5)`,
        [worker.id, completedJobs, Number(avgRating.toFixed(2)), randInt(1, Math.max(1, completedJobs)), Number(trustScore.toFixed(2))]
      );

      if (Math.random() < 0.7) {
        await client.query(
          `INSERT INTO worker_certifications (worker_id, certification_name, verification_status)
           VALUES ($1, $2, $3)`,
          [worker.id, `${worker.category} Safety Certificate`, Math.random() < 0.8 ? 'Verified' : 'Pending']
        );
      }

      if (Math.random() < 0.8) {
        await client.query(
          `INSERT INTO worker_alerts (worker_id, alert_message, status)
           VALUES ($1, $2, $3)`,
          [worker.id, `High demand expected for ${worker.category} in ${pick(workerLocations)} this week.`, Math.random() < 0.5 ? 'Unread' : 'Read']
        );
        insertedAlerts += 1;
      }
    }

    // Community subscriptions and planned jobs.
    for (let i = 0; i < 5; i += 1) {
      const customer = pick(customersRes.rows);
      const category = pick(workerCategories);
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + randInt(30, 180) * 24 * 60 * 60 * 1000);
      const subscriptionInsert = await client.query(
        `INSERT INTO community_subscriptions (community_name, service_category, subscription_type, start_date, end_date, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [`${pick(customerLocations)} Residential Block ${randInt(1, 9)}`, category, pick(subscriptionTypes), startDate, endDate, customer.id]
      );
      insertedSubscriptions += 1;

      await client.query(
        `INSERT INTO subscription_bookings (subscription_id, worker_id, scheduled_date, status)
         VALUES ($1, $2, NOW() + ($3 || ' days')::interval, 'Scheduled')`,
        [subscriptionInsert.rows[0].id, pick(workersRes.rows).id, randInt(2, 20)]
      );
    }

    // Demand analytics sample rows.
    for (const category of workerCategories) {
      await client.query(
        `INSERT INTO service_demand_stats (service_category, location, week_number, request_count, predicted_demand)
         VALUES ($1, $2, $3, $4, $5)`,
        [category, pick([...workerLocations, ...customerLocations]), randInt(10, 52), randInt(10, 80), randInt(20, 120)]
      );
    }

    // Community feed posts by temp users.
    const usersRes = await client.query(`
      SELECT id, role
      FROM Users
      WHERE email LIKE 'temp.worker%@smartcity.local'
         OR email LIKE 'temp.customer%@smartcity.local'
    `);
    for (const user of usersRes.rows) {
      if (Math.random() < 0.75) {
        await client.query(
          `INSERT INTO community_posts (user_id, content, category)
           VALUES ($1, $2, $3)`,
          [
            user.id,
            user.role === 'Worker'
              ? `Completed multiple service requests this week. Happy to support nearby communities.`
              : `Booked a local professional and had a smooth experience.`,
            user.role === 'Worker' ? 'Professional Update' : 'Customer Experience'
          ]
        );
        insertedPosts += 1;
      }
    }

    await client.query('COMMIT');
    console.log('Temporary profiles seeded successfully.');
    console.log(`Inserted workers: ${insertedWorkers}`);
    console.log(`Inserted customers: ${insertedCustomers}`);
    console.log(`Inserted bookings: ${insertedBookings}`);
    console.log(`Inserted ratings: ${insertedRatings}`);
    console.log(`Inserted alerts: ${insertedAlerts}`);
    console.log(`Inserted subscriptions: ${insertedSubscriptions}`);
    console.log(`Inserted community posts: ${insertedPosts}`);
    console.log(`Default password for all temp users: ${defaultPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTempProfiles();
