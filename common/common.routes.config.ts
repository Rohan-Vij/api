import express from 'express';
import { InMemoryRateLimiter } from "rolling-rate-limiter";

export abstract class CommonRoutesConfig {
    app: express.Application;
    name: string;
    limiter: InMemoryRateLimiter;

    constructor(app: express.Application, name: string, limiter: InMemoryRateLimiter) {
        this.app = app;
        this.name = name;
        this.limiter = limiter;
        this.configureRoutes();
    }
    getName() {
        return this.name;
    }
    abstract configureRoutes(): express.Application;
}