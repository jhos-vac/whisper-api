import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as FormData from 'form-data';

@Controller('audio')
export class AudioController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded!', HttpStatus.BAD_REQUEST);
    }

    const audioFilePath = `./uploads/${file.filename}`;

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-1'); // Especificamos el modelo de Whisper

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
        },
      );

      fs.unlinkSync(audioFilePath);

      return { message: 'Transcription successful', data: response.data };
    } catch (error) {
      console.error('Error uploading to Whisper:', error);
      throw new HttpException(
        'Error processing audio with Whisper',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
