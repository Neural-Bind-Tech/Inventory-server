import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { adminController } from './admin.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '../../../generated/prisma/enums'
import { adminValidation } from './admin.validation'
import { FileUploadHelper } from '../../../helpers/fileUploadHelper'

const router = express.Router()

router.get('/', auth(UserRole.SUPER_ADMIN), adminController.getAllAdmin)
router.get('/:id', auth(UserRole.SUPER_ADMIN), adminController.getAdminById)
router.put(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    FileUploadHelper.upload.single('file'),
    (req, _res, next) => {
        if (req?.body?.data) {
            req.body = JSON.parse(req.body.data)
        }
        next()
    },
    validateRequest(adminValidation.adminUpdateSchema),
    adminController.updateAdmin
)
router.patch('/:id/undo-delete', auth(UserRole.SUPER_ADMIN), adminController.undoDeleteAdmin)
router.delete('/:id', auth(UserRole.SUPER_ADMIN), adminController.deleteAdmin)

export const adminRoutes = router