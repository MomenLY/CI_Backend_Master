import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  data?: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    if (req.get('responseformat') === 'none') {
      return next.handle();
    }

    const statusCode = ctx.getResponse().statusCode;
    return next.handle().pipe(
      map((data) => {
        const message = data?.message || '';
        if (message) {
          delete data.message;
        }
        if (!data || (data && Object.keys(data).length === 0)) {
          return { statusCode, message };
        } else if (data.error === true) {
          return { statusCode, message, data: undefined };
        } else {
          return { statusCode, data, message: message || undefined };
        }
      }),
    );
  }
}
