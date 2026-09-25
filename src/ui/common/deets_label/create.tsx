import { DeetsLabel } from './component';

export function createDeetsLabel({
  enabled,
  reducedMotion = false,
}: {
  enabled: boolean;
  reducedMotion?: boolean;
}) {
  return enabled
    ? function BoundDeetsLabel() {
        return <DeetsLabel reducedMotion={reducedMotion} />;
      }
    : function PlainDeetsLabel() {
        return <>Your Deets</>;
      };
}
