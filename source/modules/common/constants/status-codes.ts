export enum StatusCodes {
  EmptyResponseSuccess = 204,

  IncorrectMethodType = 405,
  CollisionError = 422,
  ValidationFailed = 422,

  DatabaseError = 500,
  ServerError = 500
};
