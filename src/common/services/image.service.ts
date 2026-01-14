import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Service to handle image URL with fallback to default image from database
 */
@Injectable()
export class ImageService implements OnModuleInit {
  private readonly logger = new Logger(ImageService.name);
  private defaultImageUrl: string | null = null;
  private isInitialized = false;

  // ReffId for default/fallback image in the files table
  private readonly DEFAULT_IMAGE_REFF_ID = '404';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadDefaultImage();
  }

  /**
   * Load default image URL from database (with reffId = '404')
   * Falls back to hardcoded constant if not found in database
   */
  private async loadDefaultImage() {
    try {
      const defaultImageFile = await this.prisma.file.findFirst({
        where: {
          reffId: this.DEFAULT_IMAGE_REFF_ID,
          deleted: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (defaultImageFile) {
        this.defaultImageUrl = defaultImageFile.url;
        this.logger.log(`Default image loaded from database: ${this.defaultImageUrl}`);
      } else {
        this.defaultImageUrl = APP_CONSTANTS.DEFAULT_IMAGE_URL;
        this.logger.warn(
          `No default image found in database with reffId="${this.DEFAULT_IMAGE_REFF_ID}". Using fallback constant.`,
        );
      }

      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to load default image from database', error);
      this.defaultImageUrl = APP_CONSTANTS.DEFAULT_IMAGE_URL;
      this.isInitialized = true;
    }
  }

  /**
   * Returns the provided image URL or default image if null/undefined
   * @param imageUrl - The image URL from database or null
   * @returns Valid image URL (never null)
   */
  getImageOrDefault(imageUrl: string | null | undefined): string {
    if (!this.isInitialized) {
      this.logger.warn('ImageService not yet initialized, using fallback constant');
      return imageUrl || APP_CONSTANTS.DEFAULT_IMAGE_URL;
    }

    return imageUrl || this.defaultImageUrl || APP_CONSTANTS.DEFAULT_IMAGE_URL;
  }

  /**
   * Reload default image from database (useful if default image is updated)
   */
  async refreshDefaultImage(): Promise<void> {
    await this.loadDefaultImage();
  }

  /**
   * Get current default image URL
   */
  getDefaultImageUrl(): string {
    return this.defaultImageUrl || APP_CONSTANTS.DEFAULT_IMAGE_URL;
  }
}
