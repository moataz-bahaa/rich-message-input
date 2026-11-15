import { useMemo, useState } from 'react';
import {
  DEFAULT_TOOLBAR,
  EMPTY_DOCUMENT,
  Preview,
  TextInput,
  type DirectionSetting,
  type LocaleCode,
  type RichTextDocument,
  type ToolbarItemId,
} from 'rich-message-input';
import { toolbarItems } from '../api';
import { CodeBlock } from './CodeBlock';

type Config = {
  locale: LocaleCode;
  direction: DirectionSetting;
  theme: 'auto' | 'light' | 'dark';
  submitOnEnter: boolean;
  hideSendButton: boolean;
  disabled: boolean;
  toolbar: ToolbarItemId[];
};

const defaults: Config = {
  locale: 'en',
  direction: 'auto',
  theme: 'auto',
  submitOnEnter: false,
  hideSendButton: false,
  disabled: false,
  toolbar: [...DEFAULT_TOOLBAR],
};

const buildSnippet = (config: Config): string => {
  const props: string[] = [];
  if (config.locale !== 'en') props.push(`locale="${config.locale}"`);
  if (config.direction !== 'auto') props.push(`direction="${config.direction}"`);
  if (config.theme !== 'auto') props.push(`theme="${config.theme}"`);
  if (config.submitOnEnter) props.push('submitOnEnter');
  if (config.hideSendButton) props.push('hideSendButton');
  if (config.disabled) props.push('disabled');
  const sameToolbar = config.toolbar.join() === DEFAULT_TOOLBAR.join();
  if (!sameToolbar) props.push(`toolbar={${JSON.stringify(config.toolbar)}}`);
  props.push('onSubmit={(doc) => save(doc)}');

  return `import { TextInput, Preview } from 'rich-message-input';
import 'rich-message-input/styles.css';

<TextInput
${props.map((p) => `  ${p}`).join('\n')}
/>

<Preview value={doc}${config.locale !== 'en' ? ` locale="${config.locale}"` : ''}${config.direction !== 'auto' ? ` direction="${config.direction}"` : ''} />`;
};

type Tab = 'preview' | 'json' | 'code';

export const Playground = () => {
  const [config, setConfig] = useState<Config>(defaults);
  const [doc, setDoc] = useState<RichTextDocument>(EMPTY_DOCUMENT);
  const [sent, setSent] = useState<RichTextDocument[]>([]);
  const [tab, setTab] = useState<Tab>('preview');

  const update = <K extends keyof Config>(key: K, value: Config[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const toggleItem = (item: ToolbarItemId) =>
    update(
      'toolbar',
      toolbarItems.filter((id) => (id === item ? !config.toolbar.includes(id) : config.toolbar.includes(id))),
    );
  const snippet = useMemo(() => buildSnippet(config), [config]);

  return (
    <div className="playground">
      <aside className="playground__controls" aria-label="Playground options">
        <label>
          Locale
          <select value={config.locale} onChange={(e) => update('locale', e.target.value as LocaleCode)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
        <label>
          Direction
          <select value={config.direction} onChange={(e) => update('direction', e.target.value as DirectionSetting)}>
            <option value="auto">auto (per paragraph)</option>
            <option value="ltr">LTR</option>
            <option value="rtl">RTL</option>
          </select>
        </label>
        <label>
          Theme
          <select value={config.theme} onChange={(e) => update('theme', e.target.value as Config['theme'])}>
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
        {(['submitOnEnter', 'hideSendButton', 'disabled'] as const).map((key) => (
          <label key={key} className="check">
            <input type="checkbox" checked={config[key]} onChange={(e) => update(key, e.target.checked)} /> {key}
          </label>
        ))}
        <fieldset>
          <legend>toolbar</legend>
          {toolbarItems.map((item) => (
            <label key={item} className="check">
              <input type="checkbox" checked={config.toolbar.includes(item)} onChange={() => toggleItem(item)} /> {item}
            </label>
          ))}
        </fieldset>
        <button type="button" onClick={() => setConfig(defaults)}>
          Reset options
        </button>
      </aside>

      <div className="playground__stage">
        <TextInput
          key={config.toolbar.join() + config.locale}
          value={doc}
          onChange={setDoc}
          locale={config.locale}
          direction={config.direction}
          onDirectionChange={(d) => update('direction', d)}
          theme={config.theme}
          submitOnEnter={config.submitOnEnter}
          hideSendButton={config.hideSendButton}
          disabled={config.disabled}
          toolbar={config.toolbar.length > 0 ? config.toolbar : false}
          onSubmit={(d) => {
            setSent((all) => [d, ...all]);
            setDoc(EMPTY_DOCUMENT);
          }}
          onError={(e) => alert(e.message)}
        />

        <div role="tablist" className="tabs">
          {(['preview', 'json', 'code'] as const).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {id === 'preview' ? 'Preview' : id === 'json' ? 'JSON output' : 'Code'}
            </button>
          ))}
        </div>

        {tab === 'preview' && (
          <div className="stack">
            <div className="box">
              <Preview value={doc} locale={config.locale} direction={config.direction} theme={config.theme} />
            </div>
            {sent.map((d, i) => (
              <div className="box" key={sent.length - i}>
                <Preview value={d} locale={config.locale} direction={config.direction} theme={config.theme} />
              </div>
            ))}
            {sent.length > 0 && <small>Sent messages appear below the live preview.</small>}
          </div>
        )}
        {tab === 'json' && <CodeBlock code={JSON.stringify(doc, null, 2)} label="RichTextDocument" />}
        {tab === 'code' && <CodeBlock code={snippet} label="tsx" />}
      </div>
    </div>
  );
};
