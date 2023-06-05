import { NextResponse } from 'next/server';

export const GET = () => {
  console.log('Here!');
  return new NextResponse(null, {
    status: 204
  });
};
