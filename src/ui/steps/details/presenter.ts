import { ObservableStore, observable } from '@common/observable';
import type { Answers, FieldKey, FieldMessages } from '@common/form/types';
import { sydneyNow } from '@common/format';

type DetailsInput = Pick<
  Answers,
  | 'reportTitle'
  | 'meetingDate'
  | 'stance'
  | 'mode'
  | 'honorific'
  | 'fullName'
  | 'company'
  | 'address'
  | 'suburb'
  | 'state'
  | 'postcode'
  | 'phone'
  | 'email'
>;
export type DetailsAnswers = Required<DetailsInput>;

const AGENDA_FIELDS: FieldKey[] = ['reportTitle', 'meetingDate'];

function hasAgenda(answers: DetailsInput): boolean {
  return Boolean(answers.reportTitle.trim() && answers.meetingDate);
}

export class DetailsStore extends ObservableStore {
  @observable answers: DetailsAnswers;
  @observable messages: FieldMessages = {};
  @observable agendaExpanded: boolean;

  constructor(
    answers: DetailsInput,
    readonly assistedStance: Answers['stance'] = 'support',
  ) {
    super();
    this.answers = {
      reportTitle: answers.reportTitle,
      meetingDate: answers.meetingDate,
      stance: answers.stance,
      mode: answers.mode,
      honorific: answers.honorific,
      fullName: answers.fullName,
      company: answers.company,
      address: answers.address,
      suburb: answers.suburb ?? '',
      state: answers.state ?? '',
      postcode: answers.postcode ?? '',
      phone: answers.phone,
      email: answers.email,
    };
    this.agendaExpanded = !hasAgenda(answers);
  }

  get outsideScope(): boolean {
    return Boolean(
      this.assistedStance && this.answers.stance && this.answers.stance !== this.assistedStance,
    );
  }
}

export class DetailsPresenter {
  constructor(private readonly onChange: () => void) {}

  change<Key extends keyof DetailsAnswers>(
    store: DetailsStore,
    key: Key,
    value: DetailsAnswers[Key],
  ): void {
    store.answers = { ...store.answers, [key]: value };
    store.messages = { ...store.messages, [key]: undefined };
    this.onChange();
  }

  toggleAgenda(store: DetailsStore): void {
    store.agendaExpanded = !store.agendaExpanded;
  }

  showField(store: DetailsStore, key: FieldKey): void {
    if (AGENDA_FIELDS.includes(key)) store.agendaExpanded = true;
  }

  resetAgendaExpansion(store: DetailsStore): void {
    store.agendaExpanded = !hasAgenda(store.answers);
  }

  validate(store: DetailsStore): void {
    store.messages = this.problems(store);
    if (AGENDA_FIELDS.some(key => store.messages[key])) store.agendaExpanded = true;
  }

  problems(store: DetailsStore, today = sydneyNow().date): FieldMessages {
    const a = store.answers;
    const p: FieldMessages = {};
    if (!a.reportTitle.trim()) p.reportTitle = 'Missing. Copy the report title from the agenda.';
    if (!a.meetingDate) p.meetingDate = 'Missing. Add the date of the committee meeting.';
    else if (a.meetingDate < today)
      p.meetingDate = 'This date has passed. Check it against the agenda.';
    if (!a.stance) p.stance = 'Missing. Choose in support or in objection.';
    if (!a.mode) p.mode = 'Missing. Choose in person or via Zoom.';
    if (!a.fullName.trim()) p.fullName = 'Missing. Add your full name.';
    if (!a.address.trim()) p.address = 'Missing. Add your address.';
    if (!a.phone.trim()) p.phone = 'Missing. Add your phone number.';
    else if ((a.phone.match(/\d/g) ?? []).length < 8)
      p.phone = 'This looks too short to be a phone number. Include the area code.';
    if (!a.email.trim()) p.email = 'Missing. Add your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim()))
      p.email = "This doesn't look like an email address. Check it reads like name@example.com.";
    return p;
  }
}
