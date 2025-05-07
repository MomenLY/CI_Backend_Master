import { Controller, Get } from '@nestjs/common';
import { LayoutService } from './layout.service';
import { Public } from 'src/auth/auth.decorator';

@Controller('layout')
export class LayoutController {
  constructor(private readonly layoutService: LayoutService) {}
  @Public()
  @Get()
  getLayout() {
    return this.layoutService.getLayout();
  }
}
