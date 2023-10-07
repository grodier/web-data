import { type APIGatewayEvent, type Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

let client = new DynamoDBClient({});
let docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayEvent, _context: Context) {
  console.log("request: ", JSON.stringify(event, undefined, 2));

  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing body",
      }),
    };
  }

  let body = JSON.parse(event.body);

  let { site_id, path } = body;

  if (!site_id) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing site_id",
      }),
    };
  }

  if (!path) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing path",
      }),
    };
  }

  let update = new UpdateCommand({
    TableName: process.env.PAGE_VIEW_TABLE,
    Key: { pk: "user_id", sk: `${site_id}#${path}` },
    UpdateExpression: "ADD page_view :incr",
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
  };
}
