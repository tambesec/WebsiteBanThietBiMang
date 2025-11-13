declare module 'swagger-ui-express' {
    import { RequestHandler } from 'express';
    
    export function serve(req: any, res: any, next: any): void;
    export function setup(swaggerDoc: any, options?: any): RequestHandler;
}
