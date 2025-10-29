/**
 * Lightweight error formatter for controllers/services.
 * - Returns a plain object with { message, status, code, details }
 * - Accepts Error instances, plain objects, or strings.
 */

function format(err = {}) {
    // Already formatted by this util
    if (err && err._isFormatted) return err;

    let message = 'An unexpected error occurred';
    let status;
    let code;
    let details;

    // String error
    if (typeof err === 'string') {
        message = err;
    } else if (err instanceof Error) {
        message = err.message || message;
        status = err.status || err.statusCode;
        code = err.code;
        // Joi-like validation errors
        if (Array.isArray(err.details) && err.details.length) {
            details = err.details.map(d => (d && d.message) ? d.message : d);
        } else if (err.errors) {
            details = err.errors;
        }
        // Include stack only in non-production to aid debugging
        if (!details && process.env.NODE_ENV !== 'production') {
            details = { stack: err.stack };
        }
    } else if (typeof err === 'object' && err !== null) {
        message = err.message || err.msg || message;
        status = err.status || err.statusCode;
        code = err.code;
        if (err.details) details = err.details;
        else if (err.errors) details = err.errors;
    }

    // Ensure message is a string
    if (typeof message !== 'string') {
        try { message = String(message); } catch (e) { message = 'An unexpected error occurred'; }
    }

    const formatted = {
        _isFormatted: true,
        message,
        status,
        code,
        details
    };

    return formatted;
}

/**
 * Create a simple Error with optional metadata (status, code, details).
 * Useful for throwing from services/controllers.
 */
function create(message, { status, code, details } = {}) {
    const e = new Error(message);
    if (status) e.status = status;
    if (code) e.code = code;
    if (details) e.details = details;
    return e;
}

export default {
    format,
    create
};