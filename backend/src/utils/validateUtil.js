/**
 * src/utils/validateUtil.js
 *
 * Small validation helpers used across controllers/services.
 */

function _getByPath(obj, path) {
    if (!obj || !path) return undefined;
    const parts = String(path).split('.');
    let cur = obj;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
    }
    return cur;
}

/**
 * required(fields, obj)
 * - fields: Array<string> or string. Supports dot paths like "user.email".
 * - obj: object to check
 * Returns an array of field names that are missing or empty.
 */
function required(fields, obj = {}) {
    const list = Array.isArray(fields) ? fields : [fields];
    const missing = [];

    for (const field of list) {
        const val = _getByPath(obj, field);

        const isEmpty =
            val === undefined ||
            val === null ||
            (typeof val === 'string' && val.trim() === '') ||
            (Array.isArray(val) && val.length === 0);

        if (isEmpty) missing.push(field);
    }

    return missing;
}

function isNumber(value) {
    if (value === null || value === undefined || value === '') return false;
    return !Number.isNaN(Number(value));
}

function isInteger(value) {
    if (!isNumber(value)) return false;
    return Number.isInteger(Number(value));
}

function isPositiveInteger(value) {
    return isInteger(value) && Number(value) > 0;
}

export default {
    required,
    isNumber,
    isInteger,
    isPositiveInteger
};