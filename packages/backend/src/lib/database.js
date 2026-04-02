import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { logger } from './logger.js';
import { config } from '../config/index.js';
import { serverErrorReporter } from '../utils/server-error-reporting.js';

// ============================================================================
// PRISMA CLIENT WITH LOGGING AND SECURITY
// ============================================================================

/**
 * Get or create Prisma client instance
 * @returns {PrismaClient} Prisma client with logging
 */
let prismaClient = null;

export function getPrismaClient() {
  if (!prismaClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Configure pool with SSL for Supabase/production connections
    const poolConfig = {
      connectionString,
    };

    // Add SSL config if using Supabase or explicitly required
    if (connectionString.includes('supabase.com') || process.env.DATABASE_SSL_REQUIRED === 'true') {
      // For production: Use proper SSL with Supabase certificate
      // For development: Allow SSL bypass if certificate validation fails
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // In production, use embedded Supabase certificate for proper SSL validation
        const supabaseCert = `-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
BQAwazELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5l
dyBDYXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJh
c2UgUm9vdCAyMDIxIENBMB4XDTIxMDQyODEwNTY1M1oXDTMxMDQyNjEwNTY1M1ow
azELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5ldyBD
YXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJhc2Ug
Um9vdCAyMDIxIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQXW
QyHOB+qR2GJobCq/CBmQ40G0oDmCC3mzVnn8sv4XNeWtE5XcEL0uVih7Jo4Dkx1Q
DmGHBH1zDfgs2qXiLb6xpw/CKQPypZW1JssOTMIfQppNQ87K75Ya0p25Y3ePS2t2
GtvHxNjUV6kjOZjEn2yWEcBdpOVCUYBVFBNMB4YBHkNRDa/+S4uywAoaTWnCJLUi
cvTlHmMw6xSQQn1UfRQHk50DMCEJ7Cy1RxrZJrkXXRP3LqQL2ijJ6F4yMfh+Gyb4
O4XajoVj/+R4GwywKYrrS8PrSNtwxr5StlQO8zIQUSMiq26wM8mgELFlS/32Uclt
NaQ1xBRizkzpZct9DwIDAQABo2AwXjALBgNVHQ8EBAMCAQYwHQYDVR0OBBYEFKjX
uXY32CztkhImng4yJNUtaUYsMB8GA1UdIwQYMBaAFKjXuXY32CztkhImng4yJNUt
aUYsMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8spzNn+4VU
tVxbdMaX+39Z50sc7uATmus16jmmHjhIHz+l/9GlJ5KqAMOx26mPZgfzG7oneL2b
VW+WgYUkTT3XEPFWnTp2RJwQao8/tYPXWEJDc0WVQHrpmnWOFKU/d3MqBgBm5y+6
jB81TU/RG2rVerPDWP+1MMcNNy0491CTL5XQZ7JfDJJ9CCmXSdtTl4uUQnSuv/Qx
Cea13BX2ZgJc7Au30vihLhub52De4P/4gonKsNHYdbWjg7OWKwNv/zitGDVDB9Y2
CMTyZKG3XEu5Ghl1LEnI3QmEKsqaCLv12BnVjbkSeZsMnevJPs1Ye6TjjJwdik5P
o/bKiIz+Fq8=
-----END CERTIFICATE-----`;

        poolConfig.ssl = {
          rejectUnauthorized: true,
          ca: supabaseCert,
        };
        console.log('✅ Using Supabase CA certificate for SSL validation (production)');
      } else {
        // In development, allow SSL bypass for Supabase connections
        poolConfig.ssl = { rejectUnauthorized: false };
        console.log('⚠️ Using SSL bypass for Supabase connection (development)');
      }
    }

    const pool = new pg.Pool(poolConfig);
    const adapter = new PrismaPg(pool);

    const baseClient = new PrismaClient({
      log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'minimal',
      adapter,
    });

    // Enhanced Prisma Extension for Data Flow Tracking & Performance Monitoring
    prismaClient = baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const before = Date.now();
            try {
              const result = await query(args);
              const after = Date.now();
              const time = after - before;

              // Intelligent Feedback: Identify slow queries as bottlenecks
              if (time > 100) {
                const slowQueryMsg = `SLOW_QUERY: ${operation} on ${model} took ${time}ms`;
                logger.warn({ model, action: operation, duration: time }, slowQueryMsg);

                // Report performance bottleneck
                serverErrorReporter
                  .reportPerformanceIssue(
                    'database_query_time',
                    time,
                    100,
                    { model, operation, query: args },
                    time > 500 ? 'medium' : 'low'
                  )
                  .catch(() => {});
              }

              return result;
            } catch (error) {
              const after = Date.now();
              const time = after - before;

              // Comprehensive Error Reporting for Database Failures
              serverErrorReporter
                .reportDatabaseError(
                  `Database operation failed: ${operation} on ${model}`,
                  error,
                  { model, operation, args, duration: time },
                  'critical'
                )
                .catch(() => {});

              throw error;
            }
          },
        },
      },
    });

    logger.info('Prisma client initialized with enhanced observability');
  }

  return prismaClient;
}

export const prisma = getPrismaClient();

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma() {
  if (prismaClient) {
    await prismaClient.$disconnect();
    logger.info('Prisma client disconnected');
    prismaClient = null;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth() {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Database health check failed');
    return false;
  }
}

/**
 * Get database connection stats
 */
export async function getDatabaseStats() {
  try {
    const client = getPrismaClient();

    const [conversationCount, captureAttemptCount, providerStats] = await Promise.all([
      client.conversation.count(),
      client.captureAttempt.count(),
      client.providerStats.findMany(),
    ]);

    return {
      conversations: conversationCount,
      captureAttempts: captureAttemptCount,
      providerStats,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get database stats');
    return null;
  }
}

/**
 * Execute a callback within a transaction
 */
export async function withTransaction(callback) {
  const client = getPrismaClient();
  try {
    return await client.$transaction(callback);
  } catch (error) {
    logger.error({ error: error.message }, 'Transaction failed');
    throw error;
  }
}

export default getPrismaClient;
