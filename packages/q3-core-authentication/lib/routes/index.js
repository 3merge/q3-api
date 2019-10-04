import { Router } from 'express';
import middleware, { enforceLogin } from '../middleware';
import authenticate from './authenticate';
import passwordReset from './password-reset';
import passwordUpdate from './password-update';
import profile from './profile';
import reverify from './reverify';
import verify from './verify';

export const router = new Router();

router.post('/authenticate', authenticate);
router.post('/verify', verify);
router.post('/reverify', reverify);
router.post('/reset-password', passwordReset);

/**
 * @NOTE
 * Enforce logged-in status for last few routes.
 * Necessary, as it returns user session data.
 */
router.use(middleware);
router.use(enforceLogin);
router.post('/update-password', passwordUpdate);
router.get('/profile', profile);

export default router;
