import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DecodeText from '../components/DecodeText';
import { HeadingText, LabelText } from '../components/ui/TerminalText';

describe('semantic-first terminal text', () => {
  it('renders final cipher text as the real SSR child', () => {
    const html = renderToStaticMarkup(createElement(DecodeText, {
      as: 'h1',
      text: 'ACCESS.REQUEST',
    }));

    expect(html).toContain('<h1');
    expect(html).toContain('>ACCESS.REQUEST</h1>');
  });

  it('renders ordinary text without a layout wrapper', () => {
    const label = renderToStaticMarkup(createElement(LabelText, { text: 'EMAIL' }));
    const heading = renderToStaticMarkup(createElement(HeadingText, {
      as: 'span',
      text: 'TERMINAL [02]',
    }));

    expect(label).toContain('>EMAIL</span>');
    expect(heading).toContain('>TERMINAL [02]</span>');
    expect(label).not.toContain('<div');
    expect(heading).not.toContain('<div');
  });
});
