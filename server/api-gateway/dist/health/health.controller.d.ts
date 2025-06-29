import { HealthCheckService, HttpHealthIndicator } from "@nestjs/terminus";
export declare class HealthController {
    private healthCheckService;
    private httpHealthIndıcator;
    constructor(healthCheckService: HealthCheckService, httpHealthIndıcator: HttpHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
