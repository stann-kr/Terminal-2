import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TerminalActionLink from '../components/TerminalActionLink';
import TerminalPanel from '../components/TerminalPanel';
import ConsentCheckbox from '../components/ui/ConsentCheckbox';
import FieldError from '../components/ui/FieldError';

describe('shared accessible controls', () => {
  it('renders link-styled actions as one interactive element', () => {
    const actionProps = { href: '/gate/request', children: 'REQUEST ACCESS' };
    const html = renderToStaticMarkup(createElement(TerminalActionLink, actionProps));

    expect(html).toContain('<a');
    expect(html).toContain('href="/gate/request"');
    expect(html).toContain('min-h-11');
    expect(html).not.toContain('<button');
  });

  it('connects consent metadata and exposes focus on the visual checkbox', () => {
    const html = renderToStaticMarkup(createElement(ConsentCheckbox, {
      id: 'signal-consent',
      name: 'consent',
      checked: false,
      onChange: () => undefined,
      label: 'Consent',
      required: true,
      'aria-invalid': true,
      'aria-describedby': 'signal-consent-error',
    }));

    expect(html).toContain('id="signal-consent"');
    expect(html).toContain('name="consent"');
    expect(html).toContain('required=""');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="signal-consent-error"');
    expect(html).toContain('peer-focus-visible:outline');
  });

  it('renders titled panels as labelled sections with an explicit heading level', () => {
    const panelProps = {
      title: 'REQUEST STATUS',
      headingLevel: 3 as const,
      children: createElement('p', null, 'Ready'),
    };
    const html = renderToStaticMarkup(createElement(TerminalPanel, panelProps));
    const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1];

    expect(titleId).toBeTruthy();
    expect(html).toContain('<section');
    expect(html).toContain(`<h3 id="${titleId}"`);
    expect(html).toContain('aria-hidden="true">▶');
    expect(html).toContain('</section>');
  });

  it('uses h2 as the safe default for titled panels', () => {
    const panelProps = { title: 'DEFAULT PANEL', children: 'Content' };
    const html = renderToStaticMarkup(createElement(TerminalPanel, panelProps));

    expect(html).toContain('<section');
    expect(html).toContain('<h2');
    expect(html).toContain('aria-labelledby');
  });

  it('renders field errors as linked alert messages', () => {
    const html = renderToStaticMarkup(createElement(FieldError, {
      id: 'signal-email-error',
      message: 'Invalid email',
    }));

    expect(html).toContain('id="signal-email-error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Invalid email');
  });
});
