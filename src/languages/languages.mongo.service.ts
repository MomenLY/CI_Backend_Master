import { Injectable } from "@nestjs/common";
import { MongoRepository } from "typeorm";
import { Language } from "./entities/language.entity";

@Injectable()
export class LanguagesMongoService {
  languageFindQuery(search: string | undefined, query: any, keys: string[]) {
    if (search) {
      query.where.LDefinition = { $regex: search, $options: 'i' };
    } else {
      query.where.LKey = { $in: keys };
    }
  }

  deleteDefinitions(langRepository: MongoRepository<Language>, keys: string[], language: string) {
    return langRepository.deleteMany({ LKey: { $in: keys }, LLanguage: language }).then(result => ({ deleteCount: result.deletedCount }));
  }
}