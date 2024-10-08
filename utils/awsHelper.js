import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'eu-west-1', // Set your region
});

// Function to generate a signed URL for the image from S3
export const getSignedUrlForImage = async (bucketName, imageKey) => {
  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
    Key: imageKey,
    Expires: 60 * 60, // URL valid for 1 hour
  };
  try {
    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};
