import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'podbang-uploads';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
    });
    try {
      const objectName = `${
        Date.now() + file.originalname.replace(/ +/g, '-')
      }`;
      await new AWS.S3()
        // .config.update({region:'ap-northeast-2'})
        .createBucket({
          Bucket: BUCKET_NAME,
        })
        // 버킷 생성 시 한번만 실행
        // .putObject({
        //   Body: file.buffer,
        //   Bucket: BUCKET_NAME,
        //   Key: objectName,
        //   ACL: 'public-read',
        // })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (error) {
      return null;
    }
  }
}
