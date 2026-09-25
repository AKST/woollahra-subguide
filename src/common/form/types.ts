export interface Answers {
  reportTitle: string;
  meetingDate: string;
  stance: '' | 'support' | 'objection';
  mode: '' | 'person' | 'zoom';
  honorific: string;
  fullName: string;
  company: string;
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  phone: string;
  email: string;
  rep: '' | 'yes' | 'no';
  repDetails: string;
  accept: boolean;
  signDate: string;
}

export interface FontMetrics {
  width: (text: string, size: number) => number;
  canEncode: (text: string) => boolean;
}

export type FieldKey = keyof Answers | 'signature';
export type FieldMessages = Partial<Record<FieldKey, string>>;
export interface Issue {
  key: FieldKey;
  step: number;
  label: string;
  message: string;
}

export interface SignatureImage {
  url: string;
  width: number;
  height: number;
}

export interface Adjustment {
  dx: number;
  dy: number;
  scale: number;
}
export type Adjustments = Record<string, Adjustment>;
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ItemBase extends Box {
  id: string;
  page: number;
  label: string;
  target: Box;
  overflow: boolean;
}
export type LayoutItem =
  | (ItemBase & { kind: 'text'; size: number; lines: string[] })
  | (ItemBase & { kind: 'tick' })
  | (ItemBase & { kind: 'image'; url: string });

interface FormField {
  page: number;
  rect: [number, number, number, number];
  label: string;
}
export interface FormMap {
  file: string;
  pages: string[];
  pageSize: [number, number];
  email: string;
  reference: string;
  expires: string;
  text: Record<string, FormField & { multiline: boolean }>;
  ticks: Record<string, FormField>;
  declarationTicks: string[];
  signature: FormField;
}
