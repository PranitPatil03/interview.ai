import {
  S3Client,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (file: File, interviewId: string) => {
  try {
    const fileName = `${interviewId}-${uuidv4()}-${file.name}`;
    const key = `resumes/${fileName}`;

    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/resumes/${fileName}`;

    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

export const uploadInterviewToS3 = async (
  content: string,
  interviewId: string
) => {
  try {
    const fileName = `${interviewId}-${uuidv4()}.txt`;
    const key = `interviews/${fileName}`;

    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: key,
      Body: content,
      ContentType: "text/plain",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

    return fileUrl;
  } catch (error) {
    console.error("Error uploading interview to S3:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};

export const fetchInterviewFromS3 = async (interviewUrl: string) => {
  try {
    const response = await fetch(interviewUrl);
    const bodyContents = await response.text();

    return bodyContents;
  } catch (error) {
    console.error("Error fetching interview from S3:", error);
    throw error;
  }
};
