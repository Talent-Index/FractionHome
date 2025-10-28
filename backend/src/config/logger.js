const levels = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
let currentLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
if (!levels[currentLevel]) currentLevel = 'INFO';

function formatArgs(args) {
    return args.map(a => {
        if (a instanceof Error) return a.stack || a.message;
        if (typeof a === 'string') return a;
        if (typeof a === 'object') return a; // allow console to print objects nicely
        try { return JSON.stringify(a); } catch { return String(a); }
    });
}

function write(level, ...args) {
    if (levels[level] < levels[currentLevel]) return;
    const ts = new Date().toISOString();
    const formatted = formatArgs(args);
    const prefix = `[${ts}] [${level}]`;

    if (level === 'ERROR') {
        console.error(prefix, ...formatted);
    } else if (level === 'WARN') {
        console.warn(prefix, ...formatted);
    } else if (level === 'DEBUG') {
        (console.debug || console.log)(prefix, ...formatted);
    } else if (level === 'INFO') {
        (console.info || console.log)(prefix, ...formatted);
    } else {
        console.log(prefix, ...formatted);
    }
}

function logger(...args) {
    write('INFO', ...args);
}

logger.debug = (...args) => write('DEBUG', ...args);
logger.info = (...args) => write('INFO', ...args);
logger.warn = (...args) => write('WARN', ...args);
logger.warning = logger.warn; // alias for your preference
logger.error = (...args) => write('ERROR', ...args);

// Optional: change level at runtime: logger.setLevel('debug'|'info'|'warn'|'error')
logger.setLevel = (lvl) => {
    const L = String(lvl || '').toUpperCase();
    if (levels[L]) currentLevel = L;
};

export default logger;
