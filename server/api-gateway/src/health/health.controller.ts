import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from "@nestjs/terminus";

// Health controller method
// If you add a new Service please add a new health control mechanism
@Controller('/health')
export class HealthController {
    constructor(
        private healthCheckService: HealthCheckService,
        private httpHealthIndıcator: HttpHealthIndicator
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.healthCheckService.check([
            () => this.httpHealthIndıcator.pingCheck('nestjs.docs', 'https://docs.nestjs.com'),
        ])
    }
}