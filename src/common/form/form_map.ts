/**
 * Where each answer goes on Woollahra Council's form 26/114299,
 * "Committee Meetings – Public Forum Registration Form" (expires 30 June 2027).
 *
 * Every rectangle is [x0, y0, x1, y1] in PDF points (1/72 inch), with the origin at the
 * BOTTOM-LEFT of the page, exactly as PDF tools report it.
 *   - Text boxes come from the form's own fill-in field widgets.
 *   - Tick boxes are the visible ☐ squares, measured from a 400 dpi render.
 * `tools/measure_form.py` prints both for a new version of the form.
 */
import type { FormMap } from './types';

export const FORM: FormMap = {
  file: 'assets/form.pdf',
  pages: ['assets/pages/page-1.png', 'assets/pages/page-2.png'],
  pageSize: [595.56, 842.04], // width, height in points (A4)
  email: 'records@woollahra.nsw.gov.au',
  reference: '26/114299',
  expires: '2027-06-30',

  /** Text answers. `page` is 0-based. `multiline` answers wrap and start at the top of the box. */
  text: {
    meetingDate: {
      page: 0,
      rect: [106.0, 448.7, 574.7, 478.1],
      label: 'Date of meeting',
      multiline: false,
    },
    reportTitle: {
      page: 0,
      rect: [106.7, 414.6, 573.4, 437.5],
      label: 'Report title',
      multiline: false,
    },
    honorific: { page: 0, rect: [106.7, 262.8, 255.3, 286.3], label: 'Title', multiline: false },
    fullName: { page: 0, rect: [106.7, 232.7, 574.0, 256.2], label: 'Full name', multiline: false },
    company: {
      page: 0,
      rect: [105.4, 198.0, 574.7, 224.8],
      label: 'Company name',
      multiline: false,
    },
    address: { page: 0, rect: [106.0, 167.2, 573.4, 189.5], label: 'Address', multiline: false },
    phone: { page: 0, rect: [106.4, 136.4, 267.4, 159.3], label: 'Phone', multiline: false },
    email: { page: 0, rect: [310.9, 136.4, 574.0, 158.7], label: 'Email', multiline: false },
    repDetails: {
      page: 1,
      rect: [106.0, 743.9, 574.0, 807.3],
      label: 'Speaking on behalf of',
      multiline: true,
    },
    declName: {
      page: 1,
      rect: [47.1, 533.1, 564.9, 558.6],
      label: 'Declaration name',
      multiline: false,
    },
    signDate: {
      page: 1,
      rect: [310.3, 274.5, 574.7, 304.7],
      label: 'Date signed',
      multiline: false,
    },
  },

  /** Tick boxes. */
  ticks: {
    support: { page: 0, rect: [108.7, 389.0, 116.1, 396.4], label: 'In support' },
    objection: { page: 0, rect: [250.4, 389.0, 257.8, 396.4], label: 'In objection' },
    person: { page: 0, rect: [108.7, 352.6, 116.1, 360.0], label: 'In person' },
    zoom: { page: 0, rect: [249.8, 352.6, 256.9, 359.6], label: 'Via Zoom' },
    repYes: { page: 0, rect: [108.7, 85.9, 116.1, 93.2], label: 'Yes' },
    repNo: { page: 0, rect: [221.6, 85.9, 228.6, 92.9], label: 'No' },
    decl1: { page: 1, rect: [22.9, 501.1, 33.1, 511.4], label: 'Condition 1' },
    decl2: { page: 1, rect: [22.9, 481.7, 33.1, 491.9], label: 'Condition 2' },
    decl3: { page: 1, rect: [22.9, 462.2, 33.1, 472.5], label: 'Condition 3' },
    decl4: { page: 1, rect: [23.4, 440.8, 33.7, 451.1], label: 'Condition 4' },
    decl5: { page: 1, rect: [22.9, 416.7, 33.1, 427.0], label: 'Condition 5' },
    decl6: { page: 1, rect: [22.9, 397.3, 33.1, 407.5], label: 'Condition 6' },
    decl7: { page: 1, rect: [22.9, 377.8, 33.1, 388.1], label: 'Condition 7' },
    decl8: { page: 1, rect: [23.0, 355.3, 33.3, 365.6], label: 'Condition 8' },
    decl9: { page: 1, rect: [23.0, 316.8, 33.3, 327.1], label: 'Condition 9' },
  },

  /** Ticked together when the person accepts the declaration. */
  declarationTicks: [
    'decl1',
    'decl2',
    'decl3',
    'decl4',
    'decl5',
    'decl6',
    'decl7',
    'decl8',
    'decl9',
  ],

  signature: { page: 1, rect: [104.7, 274.8, 267.7, 302.3], label: 'Signature' },
};
