export enum StatusCodes {
  Success = 200,
  EmptyResponseSuccess = 204,

  Unauthorized = 403,
  NotFound = 404,
  IncorrectMethodType = 405,
  CollisionError = 422,
  ValidationFailed = 422,

  DatabaseError = 500,
  ServerError = 500
};
