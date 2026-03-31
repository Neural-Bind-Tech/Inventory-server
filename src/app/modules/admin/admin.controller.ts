import httpStatus from 'http-status'
import { paginationFields } from "../../../const/pagination"
import catchAsync from '../../../lib/catchAsync'
import pick from '../../../lib/pick'
import sendResponse from '../../../lib/sendResponse'
import { adminService } from "./admin.service"
import { adminFilterField } from "./admin.const"


const getAllAdmin = catchAsync(async (req, res) => {
    const filters = pick(req.query, adminFilterField)
    const options = pick(req.query, paginationFields)
    const result = await adminService.getAllAdmin(filters, options)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin's data is retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})

const getAdminById = catchAsync(async (req, res) => {
    const id = String(req.params['id'])
    const result = await adminService.getAdminById(id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin's data is retrieved successfully",
        data: result
    })
})

const updateAdmin = catchAsync(async (req, res) => {

    const result = await adminService.updateAdmin(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin's information is updated successfully",
        data: result
    })
})

const deleteAdmin = catchAsync(async (req, res) => {

    const result = await adminService.deleteAdmin(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin is deleted successfully",
        data: result
    })
})

const undoDeleteAdmin = catchAsync(async (req, res) => {
    const result = await adminService.undoDeleteAdmin(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin is restored successfully",
        data: result
    })
})

export const adminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    undoDeleteAdmin
}