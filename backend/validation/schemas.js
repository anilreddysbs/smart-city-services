import Joi from 'joi';

const emailField = Joi.string().trim().email({ tlds: { allow: false } });

const categories = [
  'Electrician',
  'Plumber',
  'Painter',
  'Construction Worker',
  'Maintenance Worker'
];

const bookingStatuses = ['Accepted', 'Completed', 'Cancelled', 'Declined'];

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: emailField.required(),
  phone: Joi.string().trim().min(6).max(30).required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.any().strip(),
  role: Joi.string().valid('Customer', 'Worker').required(),
  category: Joi.when('role', {
    is: 'Worker',
    then: Joi.string().valid(...categories).required(),
    otherwise: Joi.any().strip()
  }),
  experience: Joi.when('role', {
    is: 'Worker',
    then: Joi.number().integer().min(0).max(60).required(),
    otherwise: Joi.any().strip()
  }),
  location: Joi.string().allow('').max(255).required(),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null)
}).required();

export const loginSchema = Joi.object({
  email: emailField.required(),
  password: Joi.string().max(128).required()
}).required();

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().trim().min(6).max(30).required(),
  location: Joi.string().allow('').max(255).required(),
  experience: Joi.number().integer().min(0).max(60).allow(null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null)
}).required();

export const createBookingSchema = Joi.object({
  service_id: Joi.number().integer().positive().allow(null, ''),
  worker_id: Joi.number().integer().positive().allow(null, ''),
  requested_category: Joi.string().valid(...categories).required(),
  description: Joi.string().trim().min(3).max(2000).required(),
  start_time: Joi.date().required(),
  end_time: Joi.date().allow(null, ''),
  priority: Joi.string().valid('Normal', 'Emergency').default('Normal'),
  customer_location: Joi.string().trim().min(1).max(255).required(),
  customer_latitude: Joi.number().min(-90).max(90).allow(null),
  customer_longitude: Joi.number().min(-180).max(180).allow(null)
}).required();

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid(...bookingStatuses).required()
}).required();
