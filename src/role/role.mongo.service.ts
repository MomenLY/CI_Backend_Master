import { Injectable } from "@nestjs/common";
import { RoleDto } from "./dto/create-role.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class RoleMongoService {


  async searchRoles(roleRepository, keyword, type, sortBy, orderBy, limit, page) {
    const query: any = {};
    if (keyword && keyword.trim()) {
      query.name = { $regex: new RegExp(keyword, 'i') }
    }
    if (type && type.trim()) {
      query.roleType = { $regex: new RegExp(type, 'i') }
    }
    const totalItems = await roleRepository.countDocuments(query);
    const sortOptions = {};

    if (sortBy) {
      sortOptions[sortBy] = orderBy.toUpperCase();
    }
    const items = await roleRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      where: query,
      order: sortOptions,
    });

    const roles = items.map((role) => new RoleDto(role));

    return {
      items: items,
      roles:roles,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

async usersByRoleMongo(
  roleRepository: any, 
  keyword: string, 
  type: string, 
  sortBy: string, 
  orderBy: 'asc' | 'desc', 
  limit: number, 
  page: number
) {
  try {
    // Build the pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: "role",
          localField: "roleIds",
          foreignField: "_id",
          as: "roles",
        },
      },
      {
        $unwind: {
          path: "$roles",
          preserveNullAndEmptyArrays: true
        }
      },
      // Add filters based on keyword and type
      {
        $match: {
          $and: [
            keyword && keyword.trim() ? { 'roles.name': { $regex: new RegExp(keyword, 'i') } } : {},
            keyword && keyword.trim() ? { 'roles.roleType': { $regex: new RegExp(type, 'i') } } : {}
          ]
        }
      },
      {
        $group: {
          _id: {
            roleId: "$roles._id",
            roleType: "$roles.roleType",
            roleName: "$roles.name"
          },
          totalUsers: { $sum: 1 },
          users: {
            $push: {
              _id: "$_id",
              firstName: "$firstName",
              email: "$email",
              phoneNumber: "$phoneNumber",
              roleIds: "$roleIds"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          roleId: "$_id.roleId",
          roleType: "$_id.roleType",
          roleName: "$_id.roleName",
          totalUsers: "$totalUsers",
          users: 1
        }
      }
    ];

    // Add sorting if specified
    if (sortBy) {
      const sortStage = { $sort: { [sortBy]: orderBy === 'asc' ? 1 : -1 } };
      pipeline.push(sortStage);
    }

    // Clone pipeline for counting total items
    const totalItemsPipeline = pipeline.slice();
    totalItemsPipeline.push({ $count: 'totalItems' });
    const totalItemsResult = await roleRepository.aggregate(totalItemsPipeline).toArray();
    const totalItems = totalItemsResult.length > 0 ? totalItemsResult[0].totalItems : 0;

    // Add pagination stages
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    // Execute the pipeline
    const mongoResult = await roleRepository.aggregate(pipeline).toArray();

    // Return the pagination result
    return {
      items: mongoResult,
      meta: {
        totalItems,
        itemCount: mongoResult.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };

  } catch (error) {
    throw error;
  }
}


  findByIds(roleRepository: any, ids: string[]) {
    return roleRepository.find({
      where: { _id: { $in: ids.map((i) => new ObjectId(i)) } },
    });
  }

  findOneById(roleRepository, _id) {
    return roleRepository.findOne({
      where: { _id: new ObjectId(_id) },
    });
  }

  deleteMany(roleRepository: any, roleIds: string[]) {
    return roleRepository.deleteMany({
      _id: { $in: roleIds.map(id => new ObjectId(id)) },
    }).then(result => result.deletedCount)
  }

  getRoleName(roleRepository: any, roleId: string){
    return roleRepository.findOne(roleId, {
      projection: {name: 1}
    })
  }
}