import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('/gateway')
export class GatewayController {
  @Get('status')
  checkStatus() {
    return { status: 'API Gateway is running' };
  }

  @Get('protected')
  @Roles('customer')
  @UseGuards(AuthGuard, RolesGuard)
  getProtectedData() {
    return { data: 'This is a protected route' };
  }
}
