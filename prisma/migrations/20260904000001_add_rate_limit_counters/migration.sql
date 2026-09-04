-- Cross-instance rate limiting. See the RateLimitCounter model in
-- prisma/schema.prisma for why this exists rather than an in-memory map alone.
CREATE TABLE "rate_limit_counters" (
    "key" TEXT NOT NULL,
    "windowStart" BIGINT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_counters_pkey" PRIMARY KEY ("key","windowStart")
);

-- Supports the periodic prune of expired windows.
CREATE INDEX "rate_limit_counters_windowStart_idx" ON "rate_limit_counters"("windowStart");
