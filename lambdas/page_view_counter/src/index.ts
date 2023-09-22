import { type APIGatewayEvent, type Context } from "aws-lambda";

export async function handler(event: APIGatewayEvent, _context: Context) {
  console.log("request: ", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello World! You've hit ${event.path}\n`,
  };
}
