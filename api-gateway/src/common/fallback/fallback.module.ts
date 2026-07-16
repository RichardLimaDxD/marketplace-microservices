import { Module } from '@nestjs/common';
import { DefaultFallbackService } from './default.fallback';
import { CacheFallbackService } from './cache.fallback';

@Module({
  providers: [DefaultFallbackService, CacheFallbackService],
  exports: [DefaultFallbackService, CacheFallbackService],
})
export class FallbackModule {}
