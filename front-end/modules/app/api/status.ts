import { NextResponse } from 'next/server';

export const GET = (): NextResponse<null> => {
  return new NextResponse(null, {
    status: 204
  });
};
