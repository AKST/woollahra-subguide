import type { FieldMessages } from '@common/form/types';

export type AnswerChange<Value> = <Key extends keyof Value>(key: Key, value: Value[Key]) => void;

export interface AnswerStepProps<Value> {
  active: boolean;
  answers: Value;
  messages: FieldMessages;
  onAnswerChange: AnswerChange<Value>;
}
