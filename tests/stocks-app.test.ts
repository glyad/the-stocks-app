import { describe, expect, it } from 'vitest';
import '../src/components/stocks-app';

describe('stocks-app component', () => {
  it('registers the custom element', () => {
    expect(customElements.get('stocks-app')).toBeDefined();
  });

  it('renders the main shell', async () => {
    const element = document.createElement('stocks-app');
    document.body.appendChild(element);

    await customElements.whenDefined('stocks-app');
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    const root = element.shadowRoot;
    expect(root?.querySelector('.app')).toBeTruthy();

    element.remove();
  });
});
