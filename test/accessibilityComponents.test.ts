import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TerminalActionLink from '../components/TerminalActionLink';
import ConsentCheckbox from '../components/ui/ConsentCheckbox';

describe('shared accessible controls', () => {
  it('renders link-styled actions as one interactive element', () => {
    const actionProps = { href: '/gate/request', children: 'REQUEST ACCESS' };
    const html = renderToStaticMarkup(createElement(TerminalActionLink, actionProps));

    expect(html).toContain('<a');
    expect(html).toContain('href="/gate/request"');
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
});
