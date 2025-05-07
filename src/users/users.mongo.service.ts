import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { ColumnType } from "src/profileFields/entities/profileFields.entity";

@Injectable()
export class UsersMongoService {
  async searchUser(connection, profileFields, search, sortBy, orderBy, page, limit, roleType) {
    const userCollection = connection.getMongoRepository('user');

    const queryFields = {
      _id: 1, firstName: 1, lastName: 1, email: 1, roleIds: 1,
      dateOfBirth: 1, gender: 1, phoneNumber: 1, country: 1,
      address: 1, countryCode: 1, profileFields: 1
    };

    const searchableFields = [];
    for (const field of profileFields) {
      queryFields[field.pFColumName] = `$profile.${field.pFColumName}`;
      if([ColumnType.VARCHAR, ColumnType.TEXT].indexOf(field.pFColumType as ColumnType) > -1) {
        searchableFields.push(`profile.${field.pFColumName}`)
      }
    }

    const matchStage = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.replace(/\+/, '\\+'), 'i');
      matchStage['$or'] = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        ...searchableFields.map(field => ({ [field]: { $regex: searchRegex } }))
      ];
    }

    let sortStage = [];
    if (sortBy) {
      const order = orderBy ? orderBy.toUpperCase() : 'ASC';
      sortStage.push({ $sort: { [sortBy]: (order === 'ASC' ? 1 : -1) } });
    }

    const pipeline = [
      {
        $lookup: {
          from: 'profile',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      ...sortStage,
      { $project: queryFields },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const items = await userCollection.aggregate(pipeline).toArray();

    const totalCountPipeline = [
      {
        $lookup: {
          from: 'profile',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      { $count: 'totalItems' }
    ];

    const totalCountResult = await userCollection.aggregate(totalCountPipeline).toArray();
    const totalItems = totalCountResult.length > 0 ? totalCountResult[0].totalItems : 0;

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      }
    };
  }

  findOne(userRepository, _id) {
    return userRepository.findOne({
      where: { _id: new ObjectId(_id) },
      select: [
        '_id',
        'firstName',
        'lastName',
        'email',
        'dateOfBirth',
        'gender',
        'countryCode',
        'phoneNumber',
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