import { Request } from 'express'; 
import { User } from 'firebase/auth'
declare module 'express' {
  interface Request {
    locals: {
      user?: User;
      // ...other properties you might want to store
    };
  }
}