import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`📝 API Version: ${env.API_VERSION}`);
    // eslint-disable-next-line no-console
    console.log(`🔧 Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log('\n⛔ Đang đóng server...');
    server.close(() => {
        // eslint-disable-next-line no-console
        console.log('✅ Server đã đóng');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('\n⛔ Đang đóng server...');
    server.close(() => {
        // eslint-disable-next-line no-console
        console.log('✅ Server đã đóng');
        process.exit(0);
    });
});
