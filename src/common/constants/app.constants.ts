/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  /**
   * Fallback default image URL when database query fails
   * The actual default image should be stored in database with reffId="404"
   */
  DEFAULT_IMAGE_URL: 'https://www.diw.co.id/images/image-not-available.png',
} as const;
