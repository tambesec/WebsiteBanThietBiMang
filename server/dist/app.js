"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const pagination_1 = require("./middleware/pagination");
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
// ====== MIDDLEWARE ======
// Security
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Body Parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Logging
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined'));
}
// Pagination Middleware
app.use(pagination_1.paginationMiddleware);
// ====== ROUTES ======
app.use(`/api/${env_1.env.API_VERSION}`, index_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy endpoint',
        timestamp: new Date().toISOString(),
    });
});
// ====== ERROR HANDLING ======
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map