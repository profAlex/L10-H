import { Request } from "express";
import { SessionMetaDataType, UserIdType } from "../router-types/user-id-type";

export type RequestWithBody<B> = Request<{}, {}, B>;
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
export type RequestWithParams<P> = Request<P>;
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>;
export type RequestWithParamsAndBodyAndUserId<
  P,
  B,
  U extends UserIdType,
> = Request<P, {}, B, {}, U>;
export type RequestWithBodyAndUserId<B, U extends UserIdType> = Request<
  {},
  {},
  B,
  {},
  U
>;
export type RequestWithUserId<U extends UserIdType> = Request<
  {},
  {},
  {},
  {},
  U
>;

export type RequestWithParamsAndSessionMetaData<P, M extends SessionMetaDataType> = Request<
    P,
    {},
    {},
    {},
    M
>;

export type RequestWithSessionMetaData<M extends SessionMetaDataType> = Request<
    {},
    {},
    {},
    {},
    M
>;