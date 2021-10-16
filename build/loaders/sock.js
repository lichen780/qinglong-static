"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sockjs_1 = __importDefault(require("sockjs"));
const logger_1 = __importDefault(require("./logger"));
const typedi_1 = require("typedi");
const sock_1 = __importDefault(require("../services/sock"));
const index_1 = __importDefault(require("../config/index"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
exports.default = async ({ server }) => {
    const echo = sockjs_1.default.createServer({ prefix: '/api/ws' });
    const sockService = typedi_1.Container.get(sock_1.default);
    echo.on('connection', (conn) => {
        const data = fs_1.default.readFileSync(index_1.default.authConfigFile, 'utf8');
        const platform = util_1.getPlatform(conn.headers['user-agent'] || '') || 'desktop';
        const headerToken = conn.url.replace(`${conn.pathname}?token=`, '');
        if (data) {
            const { token = '', tokens = {} } = JSON.parse(data);
            if (headerToken === token || tokens[platform] === headerToken) {
                logger_1.default.info('✌️ Sockjs connection success');
                sockService.addClient(conn);
                conn.on('data', (message) => {
                    conn.write(message);
                });
                conn.on('close', function () {
                    sockService.removeClient(conn);
                });
                return;
            }
        }
        conn.close('404');
    });
    echo.installHandlers(server);
};
//# sourceMappingURL=sock.js.map