import { Global, Module } from '@nestjs/common';
import { ImageService } from './services/image.service';

/**
 * Global module for common services used across the application
 */
@Global()
@Module({
  providers: [ImageService],
  exports: [ImageService],
})
export class CommonModule {}
