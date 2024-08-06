'use server';

import { revalidateTag } from 'next/cache';

// see https://github.com/vercel/next.js/discussions/58600
export const customRevalidateTag = (tag: string) => {
  revalidateTag(tag);
};
