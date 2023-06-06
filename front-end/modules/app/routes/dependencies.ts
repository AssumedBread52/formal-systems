import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

export const GET = (): NextResponse<Record<string, string>> => {
  const packageJson = JSON.parse(readFileSync(process.env.npm_package_json ?? '', 'utf-8'));

  const { dependencies } = packageJson;

  return new NextResponse(JSON.stringify(dependencies));
};
