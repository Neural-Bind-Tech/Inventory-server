import { UserRole, UserStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../../lib/prisma';
import { IUploadFile } from '../../../interface/file';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { IAdmin, IEmployee, IOwner } from './user.interface';
import { bcryptUtils } from '../../../helpers/bcrypt';
import { createAuditLogAsync } from '../../../helpers/auditlog';
import { Request } from 'express';
import { JWTPayload } from '../../../interface';


const createAdmin = async (req: Request) => {

  const file = req.file as IUploadFile;
  const payload: IAdmin = req.body
  const user = req.user as JWTPayload

  let profilePhoto = null;

  if (file) {
    profilePhoto = await FileUploadHelper.uploadToCloudinary(file);
  }

  const hashedPasswordData = await bcryptUtils.hashedPassword(payload.password);

  const userData = {
    phone: payload?.admin?.phone,
    email: payload?.admin?.email,
    password: hashedPasswordData,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    lastLoginIp: '0.0.0.0',
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: {
        name: payload.admin.name,
        email: payload.admin.email,
        phone: payload.admin.phone,
        profilePicture: profilePhoto?.secure_url || null,
        userId: createdUserData.id,
      },
    });

    return {
        id: createdAdminData.id,
        name: createdAdminData.name,
        email: createdAdminData.email,
        phone: createdAdminData.phone,
        profilePicture: createdAdminData.profilePicture,
        createdAt: createdAdminData.createdAt,
        updatedAt: createdAdminData.updatedAt,
    };
  });

  // Log admin creation
  createAuditLogAsync({
    userId: user.userId,
    action: 'CREATE',
    entity: 'Admin',
    entityId: result.id,
    entityName: result.name,
    description: 'Admin user created successfully',
    newValues: {
      adminId: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      userId: result.id,
      role: 'ADMIN'
    }
  }, req);

  return result;
};

const createOwner = async (req: Request) => {

  const file = req.file as IUploadFile;
  const payload: IOwner = req.body;
  const user = req.user as JWTPayload;

  let profilePhoto = null;

  if (file) {
    profilePhoto = await FileUploadHelper.uploadToCloudinary(file);
  }

  const hashedPasswordData = await bcryptUtils.hashedPassword(payload.password);

  const userData = {
    phone: payload?.owner?.phone,
    email: payload?.owner?.email || null,
    password: hashedPasswordData,
    role: UserRole.OWNER,
    status: UserStatus.ACTIVE,
    lastLoginIp: '0.0.0.0',
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });

    const createdOwnerData = await transactionClient.owner.create({
      data: {
        name: payload.owner.name,
        email: payload.owner.email || null,
        phone: payload.owner.phone,
        profilePicture: profilePhoto?.secure_url || null,
        address: payload.owner.address || null,
        businessName: payload.owner.businessName || null,
        businessType: payload.owner.businessType || null,
        taxId: payload.owner.taxId || null,
        userId: createdUserData.id,
      },
    });

    return {
        id: createdOwnerData.id,
        name: createdOwnerData.name,
        email: createdOwnerData.email,
        phone: createdOwnerData.phone,
        profilePicture: createdOwnerData.profilePicture,
        address: createdOwnerData.address,
        businessName: createdOwnerData.businessName,
        businessType: createdOwnerData.businessType,
        taxId: createdOwnerData.taxId,
    };
  });

  createAuditLogAsync({
    userId: user.userId,
    action: 'CREATE',
    entity: 'Owner',
    entityId: result.id,
    entityName: result.name,
    description: 'Owner user created successfully',
    newValues: {
      ownerId: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      address: result.address,
      businessName: result.businessName,
      businessType: result.businessType,
      taxId: result.taxId,
      userId: result.id,
      role: 'OWNER'
    }
  }, req);

  return result;
};

const createEmployee = async (req: Request) => {

  const file = req.file as IUploadFile;
  const payload: IEmployee = req.body;
  const user = req.user as JWTPayload;

  let profilePhoto = null;

  if (file) {
    profilePhoto = await FileUploadHelper.uploadToCloudinary(file);
  }

  const hashedPasswordData = await bcryptUtils.hashedPassword(payload.password);

  const userData = {
    phone: payload.employee.phone,
    email: payload.employee.email || null,
    password: hashedPasswordData,
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    lastLoginIp: '0.0.0.0',
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });

    const createdEmployeeData = await transactionClient.employee.create({
      data: {
        shopId: payload.employee.shopId,
        name: payload.employee.name,
        email: payload.employee.email || null,
        phone: payload.employee.phone,
        profilePicture: profilePhoto?.secure_url || null,
        employeeCode: payload.employee.employeeCode,
        salary: payload.employee.salary ?? null,
        ...(payload.employee.joiningDate
          ? { joiningDate: new Date(payload.employee.joiningDate) }
          : {}),
        emergencyName: payload.employee.emergencyName,
        emergencyPhone: payload.employee.emergencyPhone,
        emergencyRelation: payload.employee.emergencyRelation,
        userId: createdUserData.id,
      },
    });

    return {
        id: createdEmployeeData.id,
        shopId: createdEmployeeData.shopId,
        name: createdEmployeeData.name,
        email: createdEmployeeData.email,
        phone: createdEmployeeData.phone,
        profilePicture: createdEmployeeData.profilePicture,
        employeeCode: createdEmployeeData.employeeCode,
        salary: createdEmployeeData.salary,
        joiningDate: createdEmployeeData.joiningDate,
        emergencyName: createdEmployeeData.emergencyName,
        emergencyPhone: createdEmployeeData.emergencyPhone,
        emergencyRelation: createdEmployeeData.emergencyRelation,
    };
  });

  createAuditLogAsync({
    userId: user.userId,
    action: 'CREATE',
    entity: 'Employee',
    entityId: result.id,
    entityName: result.name,
    description: 'Employee user created successfully',
    newValues: {
      employeeId: result.id,
      shopId: result.shopId,
      name: result.name,
      email: result.email,
      phone: result.phone,
      employeeCode: result.employeeCode,
      userId: result.id,
      role: 'EMPLOYEE'
    }
  }, req);

  return result;
};

export const UserServices = {
  createAdmin,
  createOwner,
  createEmployee
};
