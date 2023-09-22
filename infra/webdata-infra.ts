import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

class WebDataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    let pageViewCounterLambda = new lambda.Function(
      this,
      "PageViewCounterLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("../lambdas/page_view_counter/dist"),
        handler: "index.handler",
      }
    );

    let api = new apigw.RestApi(this, "base-api");
    api.root
      .addResource("event")
      .addMethod("POST", new apigw.LambdaIntegration(pageViewCounterLambda));
  }
}

let app = new cdk.App();
new WebDataStack(app, "WebDataStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
