export interface IAdminFilter {
    searchTerm?: string;
    name?: string;
    email?: string;
    phone?: string;
    isDeleted?: 'true' | 'false'
}

export interface AdminPayload {
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
}