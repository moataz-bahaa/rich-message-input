import type { ComponentType } from 'react';
import { CodeBlock } from './CodeBlock';

type Props = {
  id: string;
  title: string;
  description: string;
  Live: ComponentType;
  /** Raw source of the example file (imported with ?raw). */
  source: string;
};

export const ExampleCard = ({ id, title, description, Live, source }: Props) => (
  <article className="example" id={id}>
    <h3>{title}</h3>
    <p>{description}</p>
    <div className="example__live">
      <Live />
    </div>
    <details>
      <summary>Show code</summary>
      <CodeBlock code={source} label="tsx" />
    </details>
  </article>
);
