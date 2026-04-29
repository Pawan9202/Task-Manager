const successResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const paginate = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { skip, limit: parseInt(limit) };
};

module.exports = { successResponse, paginate };
