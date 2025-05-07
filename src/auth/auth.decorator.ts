import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const BYPASS_KEY = 'bypass';
export const BypassAuth = () => {
  return SetMetadata(BYPASS_KEY, true);
};

export const IS_CREATE_USER_KEY = 'isCreateUser';
export const CreateUser = () => SetMetadata(IS_CREATE_USER_KEY, true);

export const shouldBypassAuth = (
  context: ExecutionContext,
  reflector: Reflector,
): boolean => {
  return reflector.get(BYPASS_KEY, context.getHandler());
};
