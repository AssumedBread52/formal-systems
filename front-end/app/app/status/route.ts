import { NextResponse } from 'next/server';

export const GET = () => {
  return new NextResponse(null, {
    status: 204
  });
};
