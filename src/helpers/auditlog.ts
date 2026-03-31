import { Request } from 'express';

import { getDeviceInfo } from './getDeviceInfo';
import { AuditAction, AuditStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

interface AuditLogParams {
    // Required
    userId: string;
    action: AuditAction;
    entity: string;
    entityId: string;

    // Optional
    shopId?: string;
    entityName?: string;
    oldValues?: any;
    newValues?: any;
    reason?: string;
    description?: string;

    // Request info
    request?: Request | {
        ip?: string;
        userAgent?: string;
        endpoint?: string;
        method?: string;
    };
}

// Sensitive fields to mask
const SENSITIVE_FIELDS = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'apiKey', 'secret', 'pin'];

const maskSensitiveData = (data: any): any => {
    if (!data) return data;

    const masked = { ...data };

    SENSITIVE_FIELDS.forEach(field => {
        if (field in masked) {
            masked[field] = '***MASKED***';
        }
    });

    Object.keys(masked).forEach(key => {
        if (typeof masked[key] === 'object' && masked[key] !== null && !Array.isArray(masked[key])) {
            masked[key] = maskSensitiveData(masked[key]);
        }
    });

    return masked;
};

const calculateChanges = (oldValues: any, newValues: any): Prisma.InputJsonValue | undefined => {
    if (!oldValues || !newValues) return undefined;

    const changes: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    allKeys.forEach(key => {
        const oldVal = oldValues[key];
        const newVal = newValues[key];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes[key] = { old: oldVal, new: newVal };
        }
    });

    return Object.keys(changes).length > 0 ? changes as Prisma.InputJsonValue : undefined;
};

const createAuditLog = async (params: AuditLogParams, req: Request) => {
    try {

        // Extract request context
        const requestContext = getDeviceInfo(req);

        // Mask sensitive data
        const maskedOldValues = params.oldValues ? maskSensitiveData(params.oldValues) : undefined;
        const maskedNewValues = params.newValues ? maskSensitiveData(params.newValues) : undefined;

        // Calculate changes if both old and new values exist
        const changes = (maskedOldValues && maskedNewValues)
            ? calculateChanges(maskedOldValues, maskedNewValues)
            : undefined;

        // Create audit log entry
        const auditLog = await prisma.auditLog.create({
            data: {
                userId: params.userId,
                ...(params.shopId && { shopId: params.shopId }),
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                ...(params.entityName && { entityName: params.entityName }),
                oldValues: maskedOldValues,
                newValues: maskedNewValues,
                ...(changes && { changes: changes }),
                reason: params.reason ?? null,
                description: params.description ?? null,
                status: AuditStatus.SUCCESS,
                ipAddress: requestContext.ip,
                method: requestContext.method,
                endpoint: requestContext.endpoint
            }
        });

        return auditLog.id;
    } catch (error) {

        console.error('Failed to log audit failure:', error);

        return null;
    }
};

// Async version - fire and forget
export const createAuditLogAsync = (
    params: AuditLogParams,
    req: Request
): void => {
    createAuditLog(params, req).catch(error => {
        console.error('Async audit log failed:', error);
    });
};

// Batch create audit logs
export const createAuditLogBatch = async (
    params: AuditLogParams[],
    req: Request
) => {

    for (const param of params) {
        createAuditLogAsync(param, req);
    }
};
