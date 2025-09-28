import * as path from 'path';
import {
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3,
  aws_s3_deployment,
  CfnOutput,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, type StackProps } from 'aws-cdk-lib';

export class InfraStack extends Stack {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hostingBucket = new aws_s3.Bucket(this, 'MyShopBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new aws_cloudfront.Distribution(
      this,
      'MyShopDistribution',
      {
        defaultBehavior: {
          origin:
            aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              hostingBucket,
            ),
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      },
    );

    new aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
      sources: [
        aws_s3_deployment.Source.asset(
          path.join(__dirname, '..', '..', 'dist', 'app', 'browser'),
        ),
      ],
      destinationBucket: hostingBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    this.distributionDomain = distribution.domainName;

    new CfnOutput(this, 'CloudFrontURL', {
      value: distribution.domainName,
      description: 'The distribution URL',
      exportName: 'CloudfrontURL',
    });

    new CfnOutput(this, 'BucketName', {
      value: hostingBucket.bucketName,
      description: 'The name of the S3 bucket',
      exportName: 'BucketName',
    });
  }
}
