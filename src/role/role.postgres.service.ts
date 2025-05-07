import { Inject, Injectable } from "@nestjs/common";
import { RoleDto } from "./dto/create-role.dto";
import { TENANT_CONNECTION } from "src/tenant/tenant.module";
import { In } from "typeorm";
import { RoleType } from "./entities/role.entity";

@Injectable()
export class RolePostgresService {
  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  ) { }
  async searchRoles(roleRepository, keyword, type, sortBy, orderBy, limit, page, acl) {
    const queryBuilder = roleRepository
      .createQueryBuilder('Role')
      .where('1 = 1') // Start with a tautology
      .skip((page - 1) * limit)
      .take(limit);

    if (keyword && keyword.trim()) {
      queryBuilder.andWhere('Role.name ILIKE :keyword', {
        keyword: `%${keyword}%`,
      })
    }
    if (type && type.trim()) {
      queryBuilder.andWhere('CAST(Role.roleType AS TEXT) ILIKE :type', {
        type: `%${type}%`,
      })
    }

    if (sortBy) {
      const order = orderBy ? orderBy.toUpperCase() : 'ASC';
      if (order === 'ASC' || order === 'DESC') {
        queryBuilder.orderBy(`Role.${sortBy}`, order);
      }
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    // const roles = items.map((role) => new RoleDto(role));
    const roles = items.map((role) => {
      const roleDto = new RoleDto(role);
      if (!acl) {
        delete roleDto.acl; // Remove acl if acl parameter is false
      }
      return roleDto;
    });

    return {
      items: roles,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async usersByRolePostgres(roleRepository, keyword: string, type, sortBy, orderBy, limit, page) {
    try {
      let query = `
        SELECT
            r."_id" AS "roleId",
            r."roleType"::text AS "roleType",
            r."name" AS "roleName",
            r."areIsDefault" AS "isDefault",
            COUNT(u."_id") AS "totalUsers",
            CASE
              WHEN Count(u."_id") > 0 THEN array_agg(json_build_object(
                  '_id', u."_id",
                  'firstName', u."firstName",
                  'email', u."email",
                  'status', u."status",
                  'phoneNumber',
                  CASE
                      WHEN u."countryCode" IS NOT NULL THEN concat(u."countryCode", ' ', u."phoneNumber")
                      ELSE u."phoneNumber"
                  END 
              )) ELSE NULL
            END AS "users"
        FROM
            "public"."role" r
        LEFT JOIN
            "public"."user" u 
            ON r."_id" = ANY(u."roleIds")`;

      const conditions = [];

      if (keyword && keyword.trim()) {
        conditions.push(`
          (
            r."name" ILIKE '%${keyword}%' OR
            u."firstName" ILIKE '%${keyword}%' OR
            u."lastName" ILIKE '%${keyword}%' OR
            r."roleType"::text ILIKE '%${keyword}%'
            CONCAT(u."firstName", ' ', u."lastName") ILIKE '%${keyword}%'
          )
        `);
      }

      
      if (type && type.trim()) {
        conditions.push(`'${type}' = ANY(r."roleType"::text[])`);
      }

      if (conditions.length > 0) {
        query += `
            WHERE ${conditions.join(' AND ')}
            `;
      } else {
        query += `
            WHERE 1=1
            `;
      }
      query += `
        GROUP BY
            r."_id", r."roleType", r."name"
        `;
      const countQuery = `
        SELECT COUNT(*) AS "totalItems"
        FROM (
            ${query.replace(/\s+ORDER\s+BY\s+[^;]+;?/i, '')}
        ) AS "subquery"
        `;

      if (sortBy) {
        const order = orderBy ? orderBy.toUpperCase() : 'ASC';
        if (order === 'ASC' || order === 'DESC') {
          query += `
                ORDER BY
                    r."${sortBy}" ${order}
                `;
        }
      }

      if (limit && page) {
        const offset = (page - 1) * limit;
        query += `
            LIMIT ${limit}
            OFFSET ${offset}
            `;
      }

      const [items, totalItems] = await Promise.all([
        this.connection.query(query),
        this.connection.query(countQuery),
      ]);


      return {
        items,
        meta: {
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(totalItems[0].totalItems / limit),
          currentPage: page,
          totalItems: totalItems[0].totalItems,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findByIdsAndRemoveRoleId(roleRepository, userRepository, ids) {
    try {
      const users = await userRepository.createQueryBuilder("user")
        .where(":roleIds = ANY(user.roleIds)", { ids })
        .getMany();

      if (users.length > 0) {
        for (const user of users) {
          user.roleIds = user.roleIds.filter(roleId => !ids.includes(roleId));
          await userRepository.save(user);
          return roleRepository.find({
            where: { _id: In(ids) },
          });
        }
      } else {
      }
    } catch (e) {

    }
  }

  async findByIds(roleRepository, ids) {
    return roleRepository.find({
      where: { _id: In(ids) },
    });
  }

  findOneById(roleRepository, _id) {
    return roleRepository.findOne({
      where: { _id },
    });
  }

  async deleteMany(userRepository: any, roleRepository: any, roleIds: string[]) {
    const relatedUsers = await userRepository.createQueryBuilder('user')
      .where('user.roleIds && ARRAY[:...roleIds]::uuid[]', { roleIds })
      .getMany();
    for (let user of relatedUsers) {
      user.roleIds = user.roleIds.filter((roleId: string) => !roleIds.includes(roleId));
      await userRepository.save(user);  // Save the updated user
    }
    return roleRepository.delete({
      _id: In(roleIds),
    }).then(result => result.affected)
  }

  getRoleName(roleRepository: any, roleType: string) {
    try {
      if (roleType === 'admin') {
        const roleType = 'admin';
        return roleType;
      } else if (roleType === 'enduser') {
        const roleType =  'enduser';
        return roleType;
      } else {
        return roleRepository.findOne({ where: { _id: roleType }, select: ["roleType"] });
      }
    } catch (error) {
      throw error;
    }
  }
}