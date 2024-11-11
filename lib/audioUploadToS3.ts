import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
const S3_REGION = process.env.NEXT_PUBLIC_AWS_REGION;
const S3_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

if (
  !S3_BUCKET_NAME ||
  !S3_REGION ||
  !S3_ACCESS_KEY_ID ||
  !S3_SECRET_ACCESS_KEY
) {
  throw new Error("S3 configuration is missing in the environment variables");
}

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export async function uploadAudioToS3(
  audioBuffer: ArrayBuffer,
  fileName: string,
  contentType: string
) {
  const key = `intros/${fileName}`;

  const s3Params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: audioBuffer,
    ContentType: contentType,
  };

  const uploadResult = await s3Client.send(
    new PutObjectCommand({
      ...s3Params,
      Body: Buffer.from(audioBuffer),
    })
  );
  console.log("Audio uploaded to S3:", uploadResult);

  return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/intros/${fileName}`;
}
