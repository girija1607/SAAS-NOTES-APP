// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// This prevents Prisma from creating too many connections in a development environment
const globalForPrisma = globalThis || {};
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;