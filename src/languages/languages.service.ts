import { Inject, Injectable } from '@nestjs/common';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Language } from './entities/language.entity';
import { ILike, In, MongoRepository, Repository } from 'typeorm';
import { GlobalService } from 'src/utils/global.service';
import { delCache, getCache } from 'memcachelibrarybeta';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ErrorMessages } from 'src/utils/messages';
import { DeleteLanguageDto } from './dto/delete-language.dto';
import { LanguagesMongoService } from './languages.mongo.service';
import { LanguagesPostgresService } from './languages.postgres.service';
import { isMongoDB } from 'src/utils/helper';

@Injectable()
export class LanguagesService {
  private langRepository: Repository<Language> & MongoRepository<Language>;

  constructor(
    @Inject(TENANT_CONNECTION) private connection,
    private readonly httpService: HttpService,
    private readonly langMongoService: LanguagesMongoService,
    private readonly langPostgresService: LanguagesPostgresService,
  ) {
    this.langRepository = this.connection.getRepository(Language);
  }

  async findAll(
    lang: string,
    page: number,
    limit: number,
    search: string | undefined,
  ) {
    const urlObj = new URL(
      `/languages/${lang}`,
      process.env.SUPERADMIN_API_URL,
    );
    if (page) {
      urlObj.searchParams.set('page', page.toString());
    }
    if (limit) {
      urlObj.searchParams.set('limit', limit.toString());
    }
    if (search) {
      urlObj.searchParams.set('search', search.toString());
    }

    const { data } = await firstValueFrom(
      this.httpService.get(urlObj.toString()).pipe(
        catchError(() => {
          throw ErrorMessages.PRIMARY_DATA_FAILED;
        }),
      ),
    );

    const getItems = (keys) => {
      const query: any = {
        where: { LLanguage: lang, LAccountId: GlobalService.accountId },
      };
      if (isMongoDB) {
        this.langMongoService.languageFindQuery(search, query, keys)
      } else {
        this.langPostgresService.languageFindQuery(search, query, keys)
      }
      return this.langRepository.find(query);
    };

    if (data?.data?.items) {
      const keys = data.data.items.map((d) => d.LKey);
      const items = await getItems(keys);
      const itemsObj = {};
      const result = [];
      for (const item of items) {
        itemsObj[item.LKey] = { ...item };
      }
      for (const item of data.data.items) {
        const resultObj:any = { default: {...item}};
        if (itemsObj[item.LKey]) {
          resultObj.custom = {...itemsObj[item.LKey]};
          delete itemsObj[item.LKey];
        }
        result.push({ ...resultObj });
      }
      data.data.items = result;
      const objKeys = Object.keys(itemsObj);
      const objValues = Object.values(itemsObj);
      if (data.data.items.length < limit && objKeys.length > 0) {
        const sliceLen = limit - data.data.items.length;
        const skip = (page - 1) * limit;
        data.data.items = objValues.slice(skip, skip+sliceLen);
        data.data.meta.totalItems = data.data.meta.totalItems + objKeys.length;
        data.data.meta.itemCount = data.data.items.length;
        data.data.meta.totalPages = Math.ceil(
          data.data.meta.totalItems / limit,
        );
        data.data.meta.currentPage = page;

        const urlObj = new URL(
          `/languages/find-by-keys`,
          process.env.SUPERADMIN_API_URL,
        );
        const { data: origData } = await firstValueFrom(
          this.httpService.post(urlObj.toString(), { keys: data.data.items.map(item => item.LKey), language: lang }).pipe(
            catchError(() => {
              throw ErrorMessages.PRIMARY_DATA_FAILED;
            }),
          ),
        );

        const origDataObj = {};
        for(const d of origData.data) {
          origDataObj[d.LKey] = {...d};
        }

        data.data.items = data.data.items.map(item => ({ default: origDataObj[item.LKey], custom: item }));
      }
    }
    return data?.data || {};
  }

  findByLanguage(lang: string) {
    const getLangCb = () =>
      this.langRepository
        .find({
          where: { LLanguage: lang, LAccountId: GlobalService.accountId },
        })
        .then((res) => {
          const keyVal = {};
          for (const d of res) {
            keyVal[d.LKey] = d.LDefinition;
          }
          return keyVal;
        });
    return getCache(`lang_${lang}`, getLangCb);
  }

  async update(updateLanguageDto: UpdateLanguageDto) {
    const { data, language } = updateLanguageDto;
    const keys = Object.keys(data);
    let updateCount = 0;
    const dataToInsert = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const key of keys) {
        const langData = await queryRunner.manager
          .getRepository(Language)
          .findOne({
            where: {
              LKey: key,
              LLanguage: language,
              LAccountId: GlobalService.accountId,
            },
          });
        if (langData) {
          langData.LDefinition = data[key];
          await queryRunner.manager.getRepository(Language).save(langData);
          updateCount++;
        } else {
          dataToInsert.push({
            LKey: key,
            LDefinition: data[key],
            LLanguage: language,
            LAccountId: GlobalService.accountId,
            LCreatedAt: new Date(),
          });
        }
      }

      if (dataToInsert.length > 0) {
        await queryRunner.manager.getRepository(Language).insert(dataToInsert);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    try {
      await delCache(`lang_${language}`);
    } catch (error) {}

    return { updateCount, insertCount: dataToInsert.length };
  }

  async delete(deleteLanguageDto: DeleteLanguageDto) {
    const { keys, language } = deleteLanguageDto;
    
    if (isMongoDB) {
      return this.langMongoService.deleteDefinitions(this.langRepository, keys, language);
    } else {
      return this.langPostgresService.deleteDefinitions(this.langRepository, keys, language);
    }
  }
}
