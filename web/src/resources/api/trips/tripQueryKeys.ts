export const tripQueryKeys = {
  save: ['trips', 'save'] as const,
  list: (uid: string | null) => ['trips', uid, 'list'] as const,
  detail: (uid: string | null, id: string | undefined) =>
    ['trips', uid, 'detail', id] as const,
};
