import { InMemoryRateLimiter } from "rolling-rate-limiter";

import express from "express";

class RateLimitingMiddleware {
  createLimiter(minutes: number, maxRequests: number) {
    return new InMemoryRateLimiter({
      interval: minutes * 60 * 1000,
      maxInInterval: maxRequests,
    });
  }

  verifyLimiter(limiter: InMemoryRateLimiter, message?: string) {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      limiter.limit(req.ip).then((wasBlocked) => {
        if (wasBlocked) {
          return res.status(429).send({
            errors: message || `Exceeded rate limit!`,
          });
        } else {
          return next();
        }
      });
    };
  }
}

export default new RateLimitingMiddleware();
