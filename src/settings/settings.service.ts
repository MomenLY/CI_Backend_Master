import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AccountSettings } from './entities/setting.entity';
import { Repository } from 'typeorm';
import { SettingsLibrary } from 'src/utils/settingsLibrary';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { delCache, getCache } from 'memcachelibrarybeta';
import { ErrorMessages } from 'src/utils/messages';
import { GlobalService } from 'src/utils/global.service';

@Injectable()
export class SettingsService {
  private Settings: Repository<AccountSettings>;
  constructor(
    private settingsService: SettingsLibrary,
    @Inject(TENANT_CONNECTION) private connection,
  ) {
    this.Settings = this.connection.getRepository(AccountSettings);
  }

  async updateSettingsVersion() {
    const settingsVersion = await this.Settings.findOne({
      where: { AsKey: 'version' },
    });

    const version = Date.now();
    if (!settingsVersion) {
      const settingsVer = new AccountSettings();

      settingsVer.AsKey = 'version';
      settingsVer.AsSetting = {
        name: 'version',
        key: 'version',
        settings: { version },
      };
      settingsVer.AsAccountId = GlobalService.accountId;

      await this.Settings.save(settingsVer);
    } else {
      settingsVersion.AsSetting = {
        name: 'version',
        key: 'version',
        settings: { version },
      };
      await this.Settings.save(settingsVersion);
    }

    try {
      await delCache('version');
    } catch (error) {}

    return version;
  }

  async create(createSettingDto: CreateSettingDto) {
    try {
      const { AsKey, AsSetting } = createSettingDto;
      const settingsExist = await this.Settings.findOne({
        where: { AsKey: AsKey },
      });

      if (settingsExist) {
        throw new ConflictException(ErrorMessages.SETTINGS_ALREADY_CREATED);
      }

      if (AsKey !== AsSetting.key) {
        throw new BadRequestException(ErrorMessages.ASKEY_ASSETTING_SAME);
      } else {
        const settings = new AccountSettings();
        settings.AsKey = AsKey;
        settings.AsSetting = AsSetting;
        settings.AsAccountId = GlobalService.accountId;

        const result = await this.Settings.save(settings);

        const version = await this.updateSettingsVersion();

        return { ...result, version };
      }
    } catch (e) {
      throw e;
    }
  }

  async findAll() {
    const res = await this.Settings.find();
    const AsSettings = res.map((asSettings) => asSettings.AsSetting);
    return AsSettings;
  }

  async findOneSettings(key: string) {
    const getSetting = () => {
      return this.Settings.findOne({ where: { AsKey: key } }).then(
        (setting) => {
          return setting?.AsSetting || null;
        },
      );
    };
    const result = await getCache(key, getSetting);
    if (!result) {
      throw new NotFoundException(ErrorMessages.NO_SETTING);
    }
    return result;
  }

  async update(
    key: string,
    updateSettingDto: UpdateSettingDto,
  ) {
    const { AsSetting } = updateSettingDto;
    try {
      await delCache(key);
    } catch (error) {}
    const settingsToUpdate = await this.Settings.findOne({
      where: { AsKey: key },
    });
    if (!settingsToUpdate || settingsToUpdate === null) {
      throw new BadRequestException(ErrorMessages.NO_SETTING_TO_UPDATE);
    } else {
      settingsToUpdate.AsSetting = AsSetting;
      settingsToUpdate.AsAccountId = GlobalService.accountId;
      const updatedSettings = await this.Settings.save(settingsToUpdate);
      const version = await this.updateSettingsVersion();
      return { ...updatedSettings, version };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
  findSettings(key: string) {
    return this.settingsService.getSettings(key);
  }
  findOneByKey(accountId: string, key: string) {
    return this.Settings.findOne({
      where: { AsAccountId: accountId, AsKey: key },
    }).then((res) => res.AsSetting.settings);
  }
}
