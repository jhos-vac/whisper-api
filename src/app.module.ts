import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioController } from './audio/audio.controller';

@Module({
  imports: [],
  controllers: [AppController, AudioController],
  providers: [AppService],
})
export class AppModule {}
