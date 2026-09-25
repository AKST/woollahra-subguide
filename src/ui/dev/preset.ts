import type { Answers } from '@common/form/types';
import { sydneyNow } from '@common/format';
import type { SignatureValue } from '@ui/common/signature/types';

export interface DemoPreset {
  answers: Answers;
  signature: SignatureValue;
}

export function defaultPreset(stance: Answers['stance'] = 'support'): DemoPreset {
  const meeting = new Date();
  meeting.setDate(meeting.getDate() + 14);
  return {
    answers: {
      reportTitle: 'DA 412/2025 – 2–4 Cross Street, Double Bay',
      meetingDate: meeting.toISOString().slice(0, 10),
      stance,
      mode: 'person',
      honorific: 'Ms',
      fullName: 'Jane Citizen',
      company: 'Example Community Group',
      address: '12 Example Street',
      suburb: 'Double Bay',
      state: 'NSW',
      postcode: '2028',
      phone: '0400 123 456',
      email: 'jane@example.com',
      rep: 'yes',
      repDetails: 'Example Community Group and local residents',
      accept: true,
      signDate: sydneyNow().date,
    },
    signature: {
      mode: 'type',
      typedName: 'Jane Citizen',
      typedFont: 'caveat',
      strokes: [],
      uploadedImage: undefined,
    },
  };
}

export function readPreset(json: string | null, stance: Answers['stance'] = 'support'): DemoPreset {
  const fallback = defaultPreset(stance);
  if (!json) return fallback;
  try {
    const value = JSON.parse(json) as DemoPreset;
    if (!value || !value.answers || !value.signature) return fallback;
    const a = {
      ...value.answers,
      suburb: value.answers.suburb ?? '',
      state: value.answers.state ?? '',
      postcode: value.answers.postcode ?? '',
    };
    if (
      !Object.entries(fallback.answers).every(
        ([key, sample]) => typeof a[key as keyof Answers] === typeof sample,
      )
    )
      return fallback;
    if (
      !['', 'support', 'objection'].includes(a.stance) ||
      !['', 'person', 'zoom'].includes(a.mode) ||
      !['', 'yes', 'no'].includes(a.rep)
    )
      return fallback;
    const s = value.signature;
    if (
      !['draw', 'type', 'upload'].includes(s.mode) ||
      !['caveat', 'apple', 'delafield'].includes(s.typedFont) ||
      typeof s.typedName !== 'string' ||
      !Array.isArray(s.strokes) ||
      !s.strokes.every(
        stroke =>
          Array.isArray(stroke) &&
          stroke.every(point => point && Number.isFinite(point.x) && Number.isFinite(point.y)),
      )
    )
      return fallback;
    const image = s.uploadedImage;
    if (
      image != null &&
      (typeof image.url !== 'string' ||
        !image.url.startsWith('data:image/png;base64,') ||
        !Number.isFinite(image.width) ||
        image.width <= 0 ||
        !Number.isFinite(image.height) ||
        image.height <= 0)
    )
      return fallback;
    return { ...value, answers: a };
  } catch {
    return fallback;
  }
}
