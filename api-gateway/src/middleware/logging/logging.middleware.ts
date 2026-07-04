import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggingMiddleware.name);

  use(request: Request, response: Response, next: () => void) {
   const { method, originalUrl, ip } = request;
   const userAgent = request.get('user-agent') || '';
   const startTime = Date.now();

   this.logger.log(`Incoming request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`);

    response.on('finish', () => {
        const { statusCode } = response;
        const contentLength = response.get('Content-Length');
        const duration = Date.now() - startTime;

        this.logger.log(`Outgoing response: ${method} ${originalUrl} - Status: ${statusCode} - ${contentLength || 0} bytes - ${duration}ms`);

        if (statusCode >= 400) {
            this.logger.error(`Error response: ${method} ${originalUrl} - Status: ${statusCode} - ${contentLength || 0} bytes - ${duration}ms`);
        }
    });

    response.on('error', (error) => {
        this.logger.error(`Error response: ${method} ${originalUrl} - Status: 500 - ${error.message}`);
    });

    response.on('timeout', () => {
        this.logger.warn(`Timeout response: ${method} ${originalUrl} - Status: 504 - Timeout`);
    });

    next();
  }
}