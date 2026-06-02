export function success(reply: any, data: any, message: string = 'Success', statusCode: number = 200) {
  return reply.status(statusCode).send({
    success: true,
    message,
    data
  });
}

export function errorResponse(error: any) {
  const message = error.message || 'Internal Server Error';
  return {
    success: false,
    message
  };
}
