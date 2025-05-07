import { Injectable } from "@nestjs/common";
import { ILike, In, Repository } from "typeorm";
import { Language } from "./entities/language.entity";

@Injectable()
export class LanguagesPostgresService {
  languageFindQuery(search: string | undefined, query: any, keys: string[]) {
    if (search) {
      query.where.LDefinition = ILike(`%${search}%`);
    } else {
      query.where.LKey = In(keys);
    }
  }

  deleteDefinitions(langRepository: Repository<Language>, keys: string[], language: string) {
    return langRepository.delete({ LKey: In(keys), LLanguage: language }).then(result => ({ deleteCount: result.affected }));
  }
}