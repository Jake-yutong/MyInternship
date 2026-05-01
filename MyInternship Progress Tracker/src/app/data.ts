export const APPLICATIONS_STORAGE_KEY = 'myinternship.applications';
export const APPLICATIONS_STORAGE_BACKUP_KEY = 'myinternship.applications.backup';
export const LEGACY_APPLICATIONS_STORAGE_KEYS = ['myinternship.applications.v1'] as const;
export const APPLICATIONS_STORAGE_SCHEMA_VERSION = 2;

export const APPLICATION_STATUSES = ['未投递', '已投递', '笔试', '一面', '二面', '拒绝', 'Offer'] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type TimelineDateField = 'appliedAt' | 'testAt' | 'interview1At' | 'interview2At' | 'offerAt' | 'rejectedAt';

export type ApplicationDates = {
  appliedAt: string | null;
  testAt: string | null;
  interview1At: string | null;
  interview2At: string | null;
  offerAt: string | null;
  rejectedAt: string | null;
  updatedAt: string;
};

export type Application = {
  id: string;
  companyName: string;
  jobRole: string;
  jobDescription: string;
  status: ApplicationStatus;
  dates: ApplicationDates;
  logo: string | null;
  jobLink: string;
  applyLink: string;
  notes: string;
  createdAt: string;
};

export type TimelineStageKey = Exclude<ApplicationStatus, '未投递'>;

export type TimelineStage = {
  key: TimelineStageKey;
  label: string;
  dateField: TimelineDateField;
  accentColor: string;
  durationDays: number;
};

export type ParsedApplicationFields = Partial<Pick<Application, 'companyName' | 'jobRole' | 'jobDescription' | 'jobLink'>> & {
  matchedFields: string[];
};

type ApplicationsStorageEnvelope = {
  schemaVersion: number;
  savedAt: string;
  applications: unknown[];
};

export type ResolvedApplicationsStorage = {
  applications: Application[];
  found: boolean;
  shouldResave: boolean;
  sourceKey: string | null;
};

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; boxClassName: string; accentColor: string }> = {
  未投递: {
    label: '未投递',
    className: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30',
    boxClassName: 'bg-amber-50/80 dark:bg-amber-900/10 text-amber-950 dark:text-amber-100',
    accentColor: '#D97706',
  },
  已投递: {
    label: '已投递',
    className: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
    boxClassName: 'bg-blue-50/80 dark:bg-blue-900/10 text-blue-950 dark:text-blue-100',
    accentColor: '#2563EB',
  },
  笔试: {
    label: '笔试',
    className: 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30',
    boxClassName: 'bg-orange-50/80 dark:bg-orange-900/10 text-orange-950 dark:text-orange-100',
    accentColor: '#EA580C',
  },
  一面: {
    label: '一面',
    className: 'text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/30',
    boxClassName: 'bg-violet-50/80 dark:bg-violet-900/10 text-violet-950 dark:text-violet-100',
    accentColor: '#7C3AED',
  },
  二面: {
    label: '二面',
    className: 'text-fuchsia-700 bg-fuchsia-100 dark:text-fuchsia-300 dark:bg-fuchsia-900/30',
    boxClassName: 'bg-fuchsia-50/80 dark:bg-fuchsia-900/10 text-fuchsia-950 dark:text-fuchsia-100',
    accentColor: '#C026D3',
  },
  Offer: {
    label: 'Offer',
    className: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30',
    boxClassName: 'bg-emerald-50/80 dark:bg-emerald-900/10 text-emerald-950 dark:text-emerald-100',
    accentColor: '#16A34A',
  },
  拒绝: {
    label: '拒绝',
    className: 'text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-800',
    boxClassName: 'bg-slate-50/80 dark:bg-slate-800/30 text-slate-950 dark:text-slate-100',
    accentColor: '#64748B',
  },
};

export const DATE_FIELDS: Array<{ key: TimelineDateField; label: string }> = [
  { key: 'appliedAt', label: '投递日期' },
  { key: 'testAt', label: '笔试日期' },
  { key: 'interview1At', label: '一面日期' },
  { key: 'interview2At', label: '二面日期' },
  { key: 'offerAt', label: 'Offer 日期' },
  { key: 'rejectedAt', label: '拒绝日期' },
];

export const TIMELINE_STAGES: TimelineStage[] = [
  { key: '已投递', label: '投递', dateField: 'appliedAt', accentColor: STATUS_CONFIG.已投递.accentColor, durationDays: 3 },
  { key: '笔试', label: '笔试', dateField: 'testAt', accentColor: STATUS_CONFIG.笔试.accentColor, durationDays: 5 },
  { key: '一面', label: '一面', dateField: 'interview1At', accentColor: STATUS_CONFIG.一面.accentColor, durationDays: 4 },
  { key: '二面', label: '二面', dateField: 'interview2At', accentColor: STATUS_CONFIG.二面.accentColor, durationDays: 4 },
  { key: 'Offer', label: 'Offer', dateField: 'offerAt', accentColor: STATUS_CONFIG.Offer.accentColor, durationDays: 3 },
  { key: '拒绝', label: '拒绝', dateField: 'rejectedAt', accentColor: STATUS_CONFIG.拒绝.accentColor, durationDays: 3 },
];

const STATUS_TO_DATE_FIELD: Partial<Record<ApplicationStatus, TimelineDateField>> = {
  已投递: 'appliedAt',
  笔试: 'testAt',
  一面: 'interview1At',
  二面: 'interview2At',
  Offer: 'offerAt',
  拒绝: 'rejectedAt',
};

const LEGACY_STATUS_MAP: Record<string, ApplicationStatus> = {
  preparing: '未投递',
  applied: '已投递',
  test: '笔试',
  interview_1: '一面',
  interview_2: '二面',
  rejected: '拒绝',
  offer: 'Offer',
  未投递: '未投递',
  已投递: '已投递',
  笔试: '笔试',
  一面: '一面',
  二面: '二面',
  拒绝: '拒绝',
  Offer: 'Offer',
};

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

export function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateValueToDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function normalizeDateValue(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateValue(value);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return formatDateValue(parsedDate);
}

export function generateApplicationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyApplication(): Application {
  const now = new Date();

  return {
    id: '',
    companyName: '',
    jobRole: '',
    jobDescription: '',
    status: '未投递',
    dates: {
      appliedAt: null,
      testAt: null,
      interview1At: null,
      interview2At: null,
      offerAt: null,
      rejectedAt: null,
      updatedAt: now.toISOString(),
    },
    logo: null,
    jobLink: '',
    applyLink: '',
    notes: '',
    createdAt: now.toISOString(),
  };
}

export function getCompanyInitial(companyName: string) {
  const trimmedCompanyName = companyName.trim();
  return trimmedCompanyName ? trimmedCompanyName.charAt(0).toUpperCase() : 'M';
}

export function getCompanyAccentColor(companyName: string) {
  const palette = ['#2563EB', '#7C3AED', '#EA580C', '#16A34A', '#D946EF', '#DC2626', '#0891B2', '#CA8A04'];
  const seed = companyName.trim() || 'MyInternship';
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
}

function getFirstTrackedDate(dates: ApplicationDates) {
  return dates.appliedAt || dates.testAt || dates.interview1At || dates.interview2At || dates.offerAt || dates.rejectedAt;
}

function normalizeStatus(value: unknown): ApplicationStatus {
  if (typeof value === 'string' && value in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[value];
  }

  return '未投递';
}

function stageToDateField(stage: string): TimelineDateField | null {
  const normalizedStage = stage.toLowerCase();

  if (stage.includes('投') || normalizedStage.includes('apply')) {
    return 'appliedAt';
  }

  if (stage.includes('笔试') || normalizedStage.includes('test')) {
    return 'testAt';
  }

  if (stage.includes('一面') || normalizedStage.includes('first') || normalizedStage.includes('1st')) {
    return 'interview1At';
  }

  if (stage.includes('二面') || normalizedStage.includes('second') || normalizedStage.includes('2nd') || normalizedStage.includes('hr')) {
    return 'interview2At';
  }

  if (stage.includes('拒') || normalizedStage.includes('reject')) {
    return 'rejectedAt';
  }

  if (stage.includes('offer') || stage.includes('录用') || normalizedStage.includes('offer')) {
    return 'offerAt';
  }

  return null;
}

function extractDatesFromLegacyTimeline(value: unknown) {
  const migratedDates: Partial<ApplicationDates> = {};

  if (!Array.isArray(value)) {
    return migratedDates;
  }

  for (const event of value) {
    if (!isRecord(event)) {
      continue;
    }

    const dateValue = normalizeDateValue(event.dateStart ?? event.dateEnd);
    const field = stageToDateField(readString(event.stage));

    if (dateValue && field && !migratedDates[field]) {
      migratedDates[field] = dateValue;
    }
  }

  return migratedDates;
}

function migrateLegacyApplication(input: Record<string, unknown>): Application {
  const migratedDates = extractDatesFromLegacyTimeline(input.timeline);
  const createdAt = readString(input.createdAt) || new Date().toISOString();

  return {
    id: readString(input.id),
    companyName: readString(input.company),
    jobRole: readString(input.role),
    jobDescription: readString(input.jdFull) || readString(input.jdSummary),
    status: normalizeStatus(input.status),
    dates: {
      appliedAt: normalizeDateValue(input.dateApplied) || migratedDates.appliedAt || null,
      testAt: migratedDates.testAt || null,
      interview1At: migratedDates.interview1At || null,
      interview2At: migratedDates.interview2At || null,
      offerAt: migratedDates.offerAt || null,
      rejectedAt: migratedDates.rejectedAt || null,
      updatedAt: new Date().toISOString(),
    },
    logo: typeof input.logo === 'string' ? input.logo : null,
    jobLink: readString(input.jobLink),
    applyLink: readString(input.applyLink),
    notes: readString(input.notes),
    createdAt,
  };
}

export function normalizeApplication(input: Partial<Application> | Record<string, unknown>): Application {
  const now = new Date();
  const record = isRecord(input) ? input : {};
  const shouldUseLegacyShape = !('companyName' in record) && !('jobRole' in record) && !('dates' in record) && ('company' in record || 'role' in record);
  const baseApplication = shouldUseLegacyShape ? migrateLegacyApplication(record) : createEmptyApplication();
  const rawDates = isRecord(record.dates) ? record.dates : {};

  const normalizedApplication: Application = {
    ...baseApplication,
    id: readString(record.id) || baseApplication.id || generateApplicationId(),
    companyName: (readString(record.companyName) || baseApplication.companyName).trim(),
    jobRole: (readString(record.jobRole) || baseApplication.jobRole).trim(),
    jobDescription: (readString(record.jobDescription) || baseApplication.jobDescription).trim(),
    status: normalizeStatus(record.status || baseApplication.status),
    dates: {
      appliedAt: normalizeDateValue(rawDates.appliedAt) || baseApplication.dates.appliedAt,
      testAt: normalizeDateValue(rawDates.testAt) || baseApplication.dates.testAt,
      interview1At: normalizeDateValue(rawDates.interview1At) || baseApplication.dates.interview1At,
      interview2At: normalizeDateValue(rawDates.interview2At) || baseApplication.dates.interview2At,
      offerAt: normalizeDateValue(rawDates.offerAt) || baseApplication.dates.offerAt,
      rejectedAt: normalizeDateValue(rawDates.rejectedAt) || baseApplication.dates.rejectedAt,
      updatedAt: readString(rawDates.updatedAt) || now.toISOString(),
    },
    logo: typeof record.logo === 'string' && record.logo.trim() ? record.logo : baseApplication.logo,
    jobLink: (readString(record.jobLink) || baseApplication.jobLink).trim(),
    applyLink: (readString(record.applyLink) || baseApplication.applyLink).trim(),
    notes: readString(record.notes) || baseApplication.notes,
    createdAt: readString(record.createdAt) || baseApplication.createdAt || now.toISOString(),
  };

  if (normalizedApplication.status !== '未投递' && !normalizedApplication.dates.appliedAt) {
    normalizedApplication.dates.appliedAt = getFirstTrackedDate(normalizedApplication.dates) || formatDateValue(now);
  }

  const statusDateField = STATUS_TO_DATE_FIELD[normalizedApplication.status];
  if (statusDateField && !normalizedApplication.dates[statusDateField]) {
    normalizedApplication.dates[statusDateField] = normalizedApplication.dates.appliedAt || formatDateValue(now);
  }

  if (normalizedApplication.status === 'Offer') {
    normalizedApplication.dates.rejectedAt = null;
  }

  if (normalizedApplication.status === '拒绝') {
    normalizedApplication.dates.offerAt = null;
  }

  normalizedApplication.dates.updatedAt = now.toISOString();
  return normalizedApplication;
}

function capitalizeWord(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function inferCompanyFromLink(link: string) {
  if (!link) {
    return '';
  }

  try {
    const hostname = new URL(link).hostname.replace(/^www\./, '');
    const parts = hostname.split('.').filter(Boolean);
    const core = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

    return core
      .split('-')
      .map(capitalizeWord)
      .join(' ');
  } catch {
    return '';
  }
}

function pickPatternValue(source: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
}

function inferRoleFromKeywords(source: string) {
  const normalizedSource = source.toLowerCase();

  if (/(frontend|front-end|react|vue|javascript|typescript|前端)/.test(normalizedSource)) {
    return '前端开发实习生';
  }

  if (/(backend|后端|java|golang|python|server)/.test(normalizedSource)) {
    return '后端开发实习生';
  }

  if (/(product|产品)/.test(normalizedSource)) {
    return '产品经理实习生';
  }

  if (/(data|分析|sql|bi)/.test(normalizedSource)) {
    return '数据分析实习生';
  }

  if (/(design|designer|ux|ui|交互)/.test(normalizedSource)) {
    return '设计实习生';
  }

  if (/(algorithm|research|ml|ai|算法)/.test(normalizedSource)) {
    return '算法实习生';
  }

  return '';
}

export function parseApplicationSource(input: string): ParsedApplicationFields {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { matchedFields: [] };
  }

  const jobLinkMatch = trimmedInput.match(/https?:\/\/[^\s]+/i);
  const jobLink = jobLinkMatch?.[0] || '';
  const companyName = pickPatternValue(trimmedInput, [/(?:公司|company)\s*[:：]\s*([^\n]+)/i]) || inferCompanyFromLink(jobLink);
  const jobRole = pickPatternValue(trimmedInput, [/(?:岗位|职位|job\s*title|position|role)\s*[:：]\s*([^\n]+)/i]) || inferRoleFromKeywords(trimmedInput);
  const jobDescription = trimmedInput.replace(jobLink, '').trim();
  const matchedFields: string[] = [];

  if (companyName) {
    matchedFields.push('公司');
  }

  if (jobRole) {
    matchedFields.push('岗位');
  }

  if (jobDescription) {
    matchedFields.push('JD');
  }

  if (jobLink) {
    matchedFields.push('链接');
  }

  return {
    companyName,
    jobRole,
    jobDescription,
    jobLink,
    matchedFields,
  };
}

export function getApplicationTimeline(application: Application) {
  return TIMELINE_STAGES.flatMap((stage) => {
    const date = application.dates[stage.dateField];

    if (!date) {
      return [];
    }

    return [{ ...stage, date }];
  });
}

function createApplicationsStorageEnvelope(applications: Application[]): ApplicationsStorageEnvelope {
  return {
    schemaVersion: APPLICATIONS_STORAGE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    applications: applications.map((application) => normalizeApplication(application)),
  };
}

function normalizeStoredApplications(applications: unknown[]) {
  return applications
    .map((application) => normalizeApplication(application as Record<string, unknown>))
    .filter((application) => application.companyName || application.jobRole || application.jobDescription || application.jobLink || application.notes || application.logo);
}

type ApplicationsStorageMigrator = (payload: ApplicationsStorageEnvelope) => ApplicationsStorageEnvelope;

const APPLICATIONS_STORAGE_MIGRATORS: Record<number, ApplicationsStorageMigrator> = {
  1: (payload) => ({
    schemaVersion: 2,
    savedAt: readString(payload.savedAt) || new Date().toISOString(),
    applications: Array.isArray(payload.applications) ? payload.applications : [],
  }),
};

function migrateApplicationsStorageEnvelope(envelope: ApplicationsStorageEnvelope) {
  let currentSchemaVersion = readNumber(envelope.schemaVersion) ?? 1;
  let currentEnvelope = envelope;

  while (currentSchemaVersion < APPLICATIONS_STORAGE_SCHEMA_VERSION) {
    const migrate = APPLICATIONS_STORAGE_MIGRATORS[currentSchemaVersion];

    if (!migrate) {
      break;
    }

    currentEnvelope = migrate(currentEnvelope);
    currentSchemaVersion = readNumber(currentEnvelope.schemaVersion) ?? currentSchemaVersion + 1;
  }

  if (!Array.isArray(currentEnvelope.applications)) {
    throw new Error('Invalid applications storage payload.');
  }

  return {
    schemaVersion: APPLICATIONS_STORAGE_SCHEMA_VERSION,
    savedAt: readString(currentEnvelope.savedAt) || new Date().toISOString(),
    applications: currentEnvelope.applications,
  } satisfies ApplicationsStorageEnvelope;
}

export function parseApplicationsPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return normalizeStoredApplications(payload);
  }

  if (isRecord(payload) && Array.isArray(payload.applications)) {
    const migratedEnvelope = migrateApplicationsStorageEnvelope({
      schemaVersion: readNumber(payload.schemaVersion) ?? 1,
      savedAt: readString(payload.savedAt),
      applications: payload.applications,
    });

    return normalizeStoredApplications(migratedEnvelope.applications);
  }

  throw new Error('Unknown applications storage format.');
}

export function serializeApplicationsStorage(applications: Application[]) {
  return JSON.stringify(createApplicationsStorageEnvelope(applications));
}

export function parseApplicationsStorage(value: string): Application[] {
  const parsedValue = JSON.parse(value) as unknown;
  return parseApplicationsPayload(parsedValue);
}

const APPLICATIONS_STORAGE_READ_ORDER = [
  APPLICATIONS_STORAGE_KEY,
  ...LEGACY_APPLICATIONS_STORAGE_KEYS,
  APPLICATIONS_STORAGE_BACKUP_KEY,
] as const;

export function resolveApplicationsStorage(): ResolvedApplicationsStorage {
  if (typeof window === 'undefined') {
    return {
      applications: MOCK_APPLICATIONS,
      found: false,
      shouldResave: false,
      sourceKey: null,
    };
  }

  let primaryStorageInvalid = false;

  for (const key of APPLICATIONS_STORAGE_READ_ORDER) {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
      continue;
    }

    try {
      return {
        applications: parseApplicationsStorage(rawValue),
        found: true,
        shouldResave: primaryStorageInvalid || key !== APPLICATIONS_STORAGE_KEY,
        sourceKey: key,
      };
    } catch {
      if (key === APPLICATIONS_STORAGE_KEY) {
        primaryStorageInvalid = true;
      }
    }
  }

  return {
    applications: MOCK_APPLICATIONS,
    found: false,
    shouldResave: true,
    sourceKey: null,
  };
}

export const MOCK_APPLICATIONS: Application[] = [
  normalizeApplication({
    id: 'mock-bytedance',
    companyName: 'ByteDance',
    jobRole: '前端开发实习生',
    jobDescription: '负责招聘平台和中后台系统的 React 页面开发，关注复杂交互、组件抽象和性能优化。',
    status: '二面',
    dates: {
      appliedAt: '2026-08-18',
      testAt: '2026-08-25',
      interview1At: '2026-09-03',
      interview2At: '2026-09-10',
      offerAt: null,
      rejectedAt: null,
      updatedAt: '2026-09-10T08:30:00.000Z',
    },
    jobLink: 'https://jobs.bytedance.com',
    notes: '二面后等待结果，重点补齐性能优化与工程化问题。',
    createdAt: '2026-08-18T09:00:00.000Z',
  }),
  normalizeApplication({
    id: 'mock-tencent',
    companyName: 'Tencent',
    jobRole: '产品经理实习生',
    jobDescription: '参与增长方向需求分析，跟进方案设计、评审与上线复盘，需要较强沟通和数据分析能力。',
    status: 'Offer',
    dates: {
      appliedAt: '2026-08-12',
      testAt: null,
      interview1At: '2026-08-28',
      interview2At: '2026-09-06',
      offerAt: '2026-09-15',
      rejectedAt: null,
      updatedAt: '2026-09-15T12:00:00.000Z',
    },
    jobLink: 'https://careers.tencent.com',
    notes: '已拿到 Offer，准备横向比较团队方向。',
    createdAt: '2026-08-12T10:00:00.000Z',
  }),
  normalizeApplication({
    id: 'mock-meituan',
    companyName: 'Meituan',
    jobRole: '后端开发实习生',
    jobDescription: '参与配送系统服务开发，重点关注高并发、稳定性治理和链路监控。',
    status: '笔试',
    dates: {
      appliedAt: '2026-09-02',
      testAt: '2026-09-09',
      interview1At: null,
      interview2At: null,
      offerAt: null,
      rejectedAt: null,
      updatedAt: '2026-09-09T18:00:00.000Z',
    },
    jobLink: 'https://zhaopin.meituan.com',
    notes: '笔试已完成，等待一面通知。',
    createdAt: '2026-09-02T08:00:00.000Z',
  }),
];
