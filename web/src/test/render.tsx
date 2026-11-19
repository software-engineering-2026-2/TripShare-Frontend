import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render as testingRender,
  type RenderOptions,
} from '@testing-library/react';
import type { ReactElement } from 'react';

export function render(element: ReactElement, options?: RenderOptions) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return testingRender(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>,
    options,
  );
}
