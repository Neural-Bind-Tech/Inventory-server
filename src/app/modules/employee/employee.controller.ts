import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { employeeFilterField } from './employee.const';
import { employeeService } from './employee.service';

const getAllEmployee = catchAsync(async (req, res) => {
	const filters = pick(req.query, employeeFilterField);
	const options = pick(req.query, paginationFields);
	const result = await employeeService.getAllEmployee(filters, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Employee's data is retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getEmployeeById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await employeeService.getEmployeeById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Employee's data is retrieved successfully",
		data: result,
	});
});

const updateEmployee = catchAsync(async (req, res) => {
	const result = await employeeService.updateEmployee(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Employee's information is updated successfully",
		data: result,
	});
});

const deleteEmployee = catchAsync(async (req, res) => {
	const result = await employeeService.deleteEmployee(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Employee is deleted successfully',
		data: result,
	});
});

const undoDeleteEmployee = catchAsync(async (req, res) => {
	const result = await employeeService.undoDeleteEmployee(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Employee is restored successfully',
		data: result,
	});
});

export const employeeController = {
	getAllEmployee,
	getEmployeeById,
	updateEmployee,
	deleteEmployee,
	undoDeleteEmployee,
};
