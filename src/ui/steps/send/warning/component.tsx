import { Popover } from '@ui/common/popover/component';

export function MissingFieldsWarning() {
  return (
    <>
      Below are some missing fields.{' '}
      <Popover label="If you prefer, you can download the PDF and add those yourself">
        Note, just to be clear, your data never leaves your device. I never see it, but I also
        understand you have to take what I say at face value.
      </Popover>
      . Just be sure to include everything before you submit to speak, otherwise the council likely
      won't let you speak.
    </>
  );
}
