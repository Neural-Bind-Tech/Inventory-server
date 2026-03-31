export interface IEmployeeFilter {
	searchTerm?: string;
	name?: string;
	email?: string;
	phone?: string;
	employeeCode?: string;
	shopId?: string;
	status?: string;
	isDeleted?: 'true' | 'false';
}

export interface EmployeePayload {
	shopId?: string;
	name?: string;
	email?: string;
	phone?: string;
	profilePicture?: string;
	employeeCode?: string;
	salary?: number | string;
	joiningDate?: string;
	emergencyName?: string;
	emergencyPhone?: string;
	emergencyRelation?: string;
}
