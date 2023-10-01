import { type APIGatewayEvent, type Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

let client = new DynamoDBClient({});
let docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayEvent, _context: Context) {
  console.log("request: ", JSON.stringify(event, undefined, 2));

  let update = new UpdateCommand({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: event.path },
    UpdateExpression: "ADD hits :incr",
    ExpressionAttributeValues: { ":incr": 1 },
  });

  try {
    await docClient.send(update);
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `Oops there was an error`,
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello World! You've hit ${event.path}\n`,
  };
}
