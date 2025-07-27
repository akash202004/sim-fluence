"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class PrismaSingleton {
    constructor() { }
    static getInstance() {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new client_1.PrismaClient();
        }
        return PrismaSingleton.instance;
    }
}
exports.prisma = PrismaSingleton.getInstance();
