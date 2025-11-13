"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const constants_1 = require("../config/constants");
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Lỗi nội bộ server';
    (0, response_1.sendError)(res, message, statusCode, err.stack);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        void Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map