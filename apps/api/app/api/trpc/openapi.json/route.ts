import { openApiDocument } from "@/open-api";
import { NextResponse } from "next/server";

const handler = () => {
  return NextResponse.json(openApiDocument);
};

export const GET = handler;
