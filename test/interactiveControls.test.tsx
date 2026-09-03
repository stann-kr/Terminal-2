import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TerminalButton from '../components/TerminalButton';
import ConsentCheckbox from '../components/ui/ConsentCheckbox';
import { useFieldErrors } from '../components/ui/useFieldErrors';
import { useUrlQueryState } from '../lib/useUrlQueryState';

function QueryHarness() {
  const [event, setEvent] = useUrlQueryState('event');
  return <button onClick={() => setEvent('TRM-02')}>{event || 'NONE'}</button>;
}

function FieldErrorHarness() {
  const { showFieldErrors } = useFieldErrors<'email' | 'message'>('test');

  return (
    <div>
      <input id="test-email" aria-label="Email" />
      <input id="test-message" aria-label="Message" />
      <button type="button" onClick={() => showFieldErrors({ email: 'Required', message: 'Required' })}>
        Validate
      </button>
    </div>
  );
}

describe('interactive control behavior', () => {
  it('activates the shared button with keyboard input', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [count, setCount] = useState(0);
      return <TerminalButton onClick={() => setCount((value) => value + 1)}>COUNT {count}</TerminalButton>;
    };
    render(<Harness />);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'COUNT 1' })).toHaveClass('min-h-11');
  });

  it('forwards native ARIA state to the shared button element', () => {
    render(
      <TerminalButton aria-pressed aria-controls="event-view">
        UPCOMING
      </TerminalButton>,
    );

    const button = screen.getByRole('button', { name: 'UPCOMING' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-controls', 'event-view');
  });

  it('uses the checkbox label as a full click target', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [checked, setChecked] = useState(false);
      return (
        <ConsentCheckbox
          id="consent"
          name="consent"
          checked={checked}
          onChange={setChecked}
          label="Privacy consent"
        />
      );
    };
    render(<Harness />);

    await user.click(screen.getByText('Privacy consent'));
    expect(screen.getByRole('checkbox', { name: 'Privacy consent' })).toBeChecked();
  });

  it('updates selector query state without navigating away', async () => {
    window.history.replaceState(null, '', '/lineup?lang=ko');
    const user = userEvent.setup();
    render(<QueryHarness />);

    await user.click(screen.getByRole('button', { name: 'NONE' }));
    expect(screen.getByRole('button', { name: 'TRM-02' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/lineup');
    expect(window.location.search).toBe('?lang=ko&event=TRM-02');
  });

  it('moves focus to the first invalid field after validation', async () => {
    const user = userEvent.setup();
    render(<FieldErrorHarness />);

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus());
  });
});
