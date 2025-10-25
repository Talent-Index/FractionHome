/**
 * Standard success response formatter
 */
const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Standard error response formatter
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      errors
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Pagination metadata
 */
const paginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationMeta
};