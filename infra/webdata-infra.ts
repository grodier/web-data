import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as cf_origins from "aws-cdk-lib/aws-cloudfront-origins";

class WebDataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // BACKEND
    let table = new dynamodb.TableV2(this, "PageView", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    let pageViewCounterLambda = new lambda.Function(
      this,
      "PageViewCounterLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("../lambdas/page_view_counter/dist"),
        handler: "index.handler",
        environment: {
          PAGE_VIEW_TABLE: table.tableName,
        },
      }
    );

    table.grantReadWriteData(pageViewCounterLambda);

    let api = new apigw.RestApi(this, "base-api");
    api.root
      .addResource("event")
      .addMethod("POST", new apigw.LambdaIntegration(pageViewCounterLambda));

    // CLIENT JS
    let asset_bucket = new s3.Bucket(this, "AssetBucket", {
      accessControl: s3.BucketAccessControl.PRIVATE,
    });

    new s3_deployment.BucketDeployment(this, "AssetBucketDeployment", {
      destinationBucket: asset_bucket,
      sources: [s3_deployment.Source.asset("../client_assets/clientjs/dist")],
    });

    let originAccessIdentity = new cf.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    asset_bucket.grantRead(originAccessIdentity);

    new cf.Distribution(this, "Distribution", {
      defaultRootObject: "index.js",
      defaultBehavior: {
        origin: new cf_origins.S3Origin(asset_bucket, { originAccessIdentity }),
      },
    });
  }
}

let app = new cdk.App();
new WebDataStack(app, "WebDataStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
