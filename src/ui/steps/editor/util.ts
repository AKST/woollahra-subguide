import type { CSSProperties } from 'react';
import type { Box } from '@common/form/types';

export function boxStyle(box: Box, size: number | undefined = undefined): CSSProperties {
  return {
    '--x': box.x,
    '--y': box.y,
    '--w': box.w,
    '--h': box.h,
    '--size': size,
  } as CSSProperties;
}
