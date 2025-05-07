import { Module } from '@nestjs/common';
import { LayoutService } from './layout.service';
import { LayoutController } from './layout.controller';

import { SettingsLibrary } from 'src/utils/settingsLibrary';
import { SettingsModule } from 'src/settings/settings.module';
import { SettingsService } from 'src/settings/settings.service';

@Module({
  imports: [SettingsModule],
  controllers: [LayoutController],
  providers: [LayoutService, SettingsLibrary, SettingsService],
})
export class LayoutModule {}
