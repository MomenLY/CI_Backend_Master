import { Injectable } from '@nestjs/common';
import { ColumnType } from 'src/profileFields/entities/profileFields.entity';

@Injectable()
export class UsersPostgresService {
  async searchUser(
    connection,
    profileFields,
    search,
    sortBy,
    orderBy,
    page,
    limit,
    userType
  ) {
    const queryRunner = connection.createQueryRunner();
  
    const queryFields = [
      'u._id',
      'u."firstName"',
      'u."lastName"',
      'u.email',
      'u."roleIds"',
      'u."dateOfBirth"',
      'u."gender"',
      'u."phoneNumber"',
      'u."country"',
      'u."address"',
      'u."countryCode"',
      'u."profileFields"',
      'u."status"',
      'u."userImage"'
    ];
    let joinCond = '';
    const searchableFields = [];
    const hasTable = await queryRunner.hasTable('profile');
    if (hasTable) {
      for (const field of profileFields) {
        queryFields.push(`p."${field.pFColumName}"`);
        if (
          [ColumnType.VARCHAR, ColumnType.TEXT].indexOf(
            field.pFColumType as ColumnType,
          ) > -1
        ) {
          searchableFields.push(`OR p."${field.pFColumName}" ILIKE $1`);
        }
      }
      joinCond = 'LEFT JOIN profile p ON u._id = p."userId"';
    }
  
    let whereCond = [];
    let queryParamArray: any = [limit, (page - 1) * limit];
    let countParamArray = [];
    if (search && search.trim()) {
      whereCond.push(
        `(CONCAT(u."firstName", ' ', u."lastName") ILIKE $1 OR u.email ILIKE $1 ${searchableFields.join(' ')})`,
      );
      queryParamArray = [
        `%${search.replace(/\+/, '\\+')}%`,
        ...queryParamArray,
      ];
      countParamArray = [`%${search.replace(/\+/, '\\+')}%`];
    }
  
    if (userType === 'enduser' || userType === 'admin') {
      whereCond.push(
        `u."roleIds" && (SELECT ARRAY(SELECT "_id" FROM public."role" WHERE public."role"."roleType" = '${
          userType
        }'))`,
      );
    }
  
    let orderByCond = '';
    if (sortBy) {
      const order = orderBy ? orderBy.toUpperCase() : 'ASC';
      if (order === 'ASC' || order === 'DESC') {
        orderByCond = `ORDER BY u."${sortBy}" ${order}`;
      }
    }
  
    const items = await queryRunner.query(
      `
            SELECT 
              ${queryFields.join(', ')}
            FROM 
              public."user" u
            ${joinCond} 
            ${whereCond.length > 0 ? " WHERE " + whereCond.join(" AND ") : ""} 
            ${orderByCond} 
            LIMIT $${queryParamArray.length - 1} 
            OFFSET $${queryParamArray.length};
        `,
      queryParamArray,
    );
  
    const totalCount = await queryRunner.query(
      `
            SELECT 
              COUNT(*)
            FROM 
              public."user" u
            ${joinCond} 
            ${whereCond.length > 0 ? " WHERE " + whereCond.join(" AND ") : ""};
        `,
      countParamArray,
    );
  
    await queryRunner.release();
  
    const totalItems = totalCount[0]?.count
      ? parseInt(totalCount[0].count, 10)
      : 0;
  
    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  findOne(userRepository, _id) {
    return userRepository.findOne({
      where: { _id: _id },
      select: [
        '_id',
        'firstName',
        'lastName',
        'email',
        'dateOfBirth',
        'gender',
        'countryCode',
        'phoneNumber',
        'password',
        'country',
        'address',
        'acl',
        'roleIds',
        'createdAt',
        'updatedAt',
        'enforcePasswordReset',
        'userImage'
      ],
    });
  }
}
