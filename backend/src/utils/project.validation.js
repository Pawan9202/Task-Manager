const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow(''),
  members: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).default([]),
  color: Joi.string().pattern(/^#([0-9A-F]{3}){1,2}$/i).default('#3B82F6')
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(''),
  members: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  status: Joi.string().valid('active', 'archived'),
  color: Joi.string().pattern(/^#([0-9A-F]{3}){1,2}$/i)
});

module.exports = { createProjectSchema, updateProjectSchema };
