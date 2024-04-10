/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');


const AWS_REGION = process.env.AWS_REGION_1 || 'ap-south-1';
const AWS_USER_POOL_ID = process.env.AWS_USER_POOL_ID ;
const cognito = new AWS.CognitoIdentityServiceProvider({ region: AWS_REGION }); // Replace 'YOUR_REGION' with the AWS region where your Cognito user pool is located.



exports.handler = async (event, context) => {
  try {
    const userPoolId = AWS_USER_POOL_ID; // Replace 'YOUR_USER_POOL_ID' with the actual User Pool ID.

    // List all users in the user pool with the 'CONFIRMED' status.
    const confirmedUsers = await cognito.listUsers({
      UserPoolId: userPoolId,
      Filter: 'cognito:user_status = "CONFIRMED"',
    }).promise();

    // Delete unconfirmed users one by one.
    for (const user of confirmedUsers.Users) {
      await cognito.adminDeleteUser({
        UserPoolId: userPoolId,
        Username: user.Username,
      }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Unconfirmed users deleted successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
