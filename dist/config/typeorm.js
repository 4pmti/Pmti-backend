"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSource = void 0;
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const typeorm_1 = require("typeorm");
(0, dotenv_1.config)({ path: '.env' });
const config = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    saltkey: process.env.SALT_KEY,
    entities: [
        (0, path_1.join)(__dirname, '../../node_modules/@festa-world/common/dist/index.js'),
    ],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: false,
    autoLoadEntities: true,
    ssl: process.env.SSL_MODE == 'false' || false ? false : true,
};
exports.default = (0, config_1.registerAs)('typeorm', () => config);
exports.connectionSource = new typeorm_1.DataSource(config);
//# sourceMappingURL=typeorm.js.map