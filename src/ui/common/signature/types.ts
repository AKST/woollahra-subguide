import type { SignatureImage } from '@common/form/types';

export type TypedFont = 'caveat' | 'apple' | 'delafield';
export type Stroke = { x: number; y: number }[];
export interface SignatureValue {
  mode: 'draw' | 'type' | 'upload';
  typedName: string;
  typedFont: TypedFont;
  strokes: Stroke[];
  uploadedImage: SignatureImage | undefined;
}
