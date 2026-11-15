import type { DeepPartial, Direction, DirectionSetting, LocaleCode, Messages } from './types';

export const en: Messages = {
  placeholder: 'Write a message… type / for commands',
  send: 'Send',
  toolbar: {
    toolbarLabel: 'Formatting',
    heading: 'Heading',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    code: 'Inline code',
    highlight: 'Highlight',
    link: 'Link',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    codeBlock: 'Code block',
    divider: 'Divider',
    attach: 'Attach file',
    audio: 'Record voice message',
    video: 'Record video',
    direction: 'Switch text direction',
  },
  link: { title: 'Link', urlLabel: 'URL', urlPlaceholder: 'https://example.com', apply: 'Apply', remove: 'Remove', cancel: 'Cancel' },
  slash: { menuLabel: 'Commands', noResults: 'No matching commands' },
  commands: {
    paragraph: { title: 'Text', description: 'Plain body text', keywords: ['body', 'paragraph', 'normal'] },
    h1: { title: 'Heading 1', description: 'Large heading', keywords: ['heading', 'title'] },
    h2: { title: 'Heading 2', description: 'Medium heading', keywords: ['heading'] },
    h3: { title: 'Heading 3', description: 'Small heading', keywords: ['heading'] },
    bold: { title: 'Bold', description: 'Toggle bold', keywords: ['strong'] },
    italic: { title: 'Italic', description: 'Toggle italic', keywords: ['emphasis'] },
    underline: { title: 'Underline', description: 'Toggle underline' },
    strike: { title: 'Strikethrough', description: 'Toggle strikethrough', keywords: ['strike', 'delete'] },
    highlight: { title: 'Highlight', description: 'Toggle highlight', keywords: ['mark'] },
    code: { title: 'Inline code', description: 'Toggle inline code', keywords: ['monospace'] },
    codeblock: { title: 'Code block', description: 'Insert a code block', keywords: ['pre', 'snippet'] },
    link: { title: 'Link', description: 'Insert a hyperlink', keywords: ['url', 'href'] },
    list: { title: 'Bulleted list', description: 'Create a bulleted list', keywords: ['bullet', 'ul'] },
    numbered: { title: 'Numbered list', description: 'Create a numbered list', keywords: ['ordered', 'ol', 'list'] },
    quote: { title: 'Quote', description: 'Insert a block quote', keywords: ['blockquote'] },
    divider: { title: 'Divider', description: 'Insert a horizontal line', keywords: ['hr', 'separator', 'line'] },
    attach: { title: 'Attach file', description: 'Upload a file', keywords: ['upload', 'file', 'image'] },
    audio: { title: 'Voice message', description: 'Record audio', keywords: ['record', 'mic'] },
    video: { title: 'Video clip', description: 'Record a video', keywords: ['record', 'camera'] },
    direction: { title: 'Text direction', description: 'Switch between LTR and RTL', keywords: ['rtl', 'ltr'] },
  },
  recording: {
    audio: 'Recording voice message',
    video: 'Recording video',
    stop: 'Stop & attach',
    cancel: 'Cancel',
    unsupported: 'Recording is not supported in this browser.',
    denied: 'Could not access the microphone or camera.',
    failed: 'The recording failed.',
  },
  attachment: { remove: 'Remove attachment', uploading: 'Uploading…', uploadFailed: 'Upload failed' },
};

export const ar: Messages = {
  placeholder: 'اكتب رسالة… اكتب / لعرض الأوامر',
  send: 'إرسال',
  toolbar: {
    toolbarLabel: 'التنسيق',
    heading: 'عنوان',
    bold: 'غامق',
    italic: 'مائل',
    underline: 'تسطير',
    strike: 'يتوسطه خط',
    code: 'كود مضمّن',
    highlight: 'تمييز',
    link: 'رابط',
    bulletList: 'قائمة نقطية',
    orderedList: 'قائمة مرقمة',
    codeBlock: 'كتلة كود',
    divider: 'فاصل',
    attach: 'إرفاق ملف',
    audio: 'تسجيل رسالة صوتية',
    video: 'تسجيل فيديو',
    direction: 'تبديل اتجاه النص',
  },
  link: { title: 'رابط', urlLabel: 'الرابط', urlPlaceholder: 'https://example.com', apply: 'تطبيق', remove: 'إزالة', cancel: 'إلغاء' },
  slash: { menuLabel: 'الأوامر', noResults: 'لا توجد أوامر مطابقة' },
  commands: {
    paragraph: { title: 'نص', description: 'نص عادي', keywords: ['فقرة', 'paragraph'] },
    h1: { title: 'عنوان 1', description: 'عنوان كبير', keywords: ['عنوان', 'heading'] },
    h2: { title: 'عنوان 2', description: 'عنوان متوسط', keywords: ['عنوان', 'heading'] },
    h3: { title: 'عنوان 3', description: 'عنوان صغير', keywords: ['عنوان', 'heading'] },
    bold: { title: 'غامق', description: 'تبديل الخط الغامق', keywords: ['عريض', 'bold'] },
    italic: { title: 'مائل', description: 'تبديل الخط المائل', keywords: ['italic'] },
    underline: { title: 'تسطير', description: 'تبديل التسطير', keywords: ['underline'] },
    strike: { title: 'يتوسطه خط', description: 'تبديل الشطب', keywords: ['شطب', 'strike'] },
    highlight: { title: 'تمييز', description: 'تبديل التمييز', keywords: ['highlight'] },
    code: { title: 'كود مضمّن', description: 'تبديل الكود المضمّن', keywords: ['كود', 'code'] },
    codeblock: { title: 'كتلة كود', description: 'إدراج كتلة كود', keywords: ['كود', 'codeblock'] },
    link: { title: 'رابط', description: 'إدراج رابط', keywords: ['رابط', 'link'] },
    list: { title: 'قائمة نقطية', description: 'إنشاء قائمة نقطية', keywords: ['قائمة', 'list'] },
    numbered: { title: 'قائمة مرقمة', description: 'إنشاء قائمة مرقمة', keywords: ['قائمة', 'مرقمة', 'numbered'] },
    quote: { title: 'اقتباس', description: 'إدراج اقتباس', keywords: ['quote'] },
    divider: { title: 'فاصل', description: 'إدراج خط أفقي', keywords: ['خط', 'divider'] },
    attach: { title: 'إرفاق ملف', description: 'رفع ملف', keywords: ['ملف', 'صورة', 'attach'] },
    audio: { title: 'رسالة صوتية', description: 'تسجيل صوت', keywords: ['صوت', 'audio'] },
    video: { title: 'مقطع فيديو', description: 'تسجيل فيديو', keywords: ['فيديو', 'video'] },
    direction: { title: 'اتجاه النص', description: 'التبديل بين LTR و RTL', keywords: ['اتجاه', 'rtl', 'ltr'] },
  },
  recording: {
    audio: 'جارٍ تسجيل رسالة صوتية',
    video: 'جارٍ تسجيل فيديو',
    stop: 'إيقاف وإرفاق',
    cancel: 'إلغاء',
    unsupported: 'التسجيل غير مدعوم في هذا المتصفح.',
    denied: 'تعذر الوصول إلى الميكروفون أو الكاميرا.',
    failed: 'فشل التسجيل.',
  },
  attachment: { remove: 'إزالة المرفق', uploading: 'جارٍ الرفع…', uploadFailed: 'فشل الرفع' },
};

export const locales: Record<LocaleCode, Messages> = { en, ar };
export const localeDirection: Record<LocaleCode, Direction> = { en: 'ltr', ar: 'rtl' };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const merge = <T,>(base: T, patch: unknown): T => {
  if (!isObject(base) || !isObject(patch)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = isObject(out[key]) && isObject(value) ? merge(out[key], value) : value;
  }
  return out as T;
};

export const resolveMessages = (locale: LocaleCode = 'en', overrides?: DeepPartial<Messages>): Messages =>
  merge(locales[locale] ?? en, overrides);

/** Direction of the editor chrome (toolbar, menus). `auto` follows the locale. */
export const resolveDirection = (setting: DirectionSetting, locale: LocaleCode = 'en'): Direction =>
  setting === 'auto' ? (localeDirection[locale] ?? 'ltr') : setting;
