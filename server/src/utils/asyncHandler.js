/**
 * @function asyncHandler
 * @description Middleware wrapper to capture and propagate errors from async route handlers.
 * Eliminates the need for explicit try/catch blocks in Express controllers.
 * 
 * @param {Function} requestHandler - The async function to be wrapped.
 * @returns {Function} Express-compatible middleware function.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

export { asyncHandler };
