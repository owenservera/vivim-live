import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        did?: string;
        [key: string]: any;
      };
      virtualUser?: {
        id: string;
        fingerprint: string;
        displayName?: string;
        consentGiven: boolean;
        currentAvatar?: string;
        [key: string]: any;
      };
      userId?: string;
    }
  }
}

export {};
