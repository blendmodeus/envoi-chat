import { describe, expect, it } from 'vitest';

import { extractFileIdsFromEditorData } from './extractFileIdsFromEditorData';

describe('extractFileIdsFromEditorData', () => {
  it('returns [] for null / undefined / empty inputs', () => {
    expect(extractFileIdsFromEditorData(null)).toEqual([]);
    expect(extractFileIdsFromEditorData(undefined)).toEqual([]);
    expect(extractFileIdsFromEditorData({})).toEqual([]);
    expect(extractFileIdsFromEditorData({ root: { children: [] } })).toEqual([]);
  });

  it('extracts fileId from a block-image src', () => {
    const json = {
      root: {
        children: [
          { type: 'paragraph', children: [] },
          {
            type: 'block-image',
            src: 'https://app.lobehub.com/f/fle_abc123',
          },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual(['fle_abc123']);
  });

  it('extracts fileId from inline-image and file nodes', () => {
    const json = {
      root: {
        children: [
          {
            type: 'inline-image',
            src: 'https://app.lobehub.com/f/fle_inline_1',
          },
          {
            type: 'file',
            fileUrl: 'https://app.lobehub.com/f/fle_pdf_2',
          },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json).sort()).toEqual(['fle_inline_1', 'fle_pdf_2']);
  });

  it('recurses into nested children', () => {
    const json = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'block-image',
                src: 'https://app.lobehub.com/f/fle_nested',
              },
            ],
          },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual(['fle_nested']);
  });

  it('deduplicates repeated fileIds', () => {
    const json = {
      root: {
        children: [
          { type: 'block-image', src: 'https://app.lobehub.com/f/fle_x' },
          { type: 'block-image', src: 'https://app.lobehub.com/f/fle_x' },
          { type: 'file', fileUrl: 'https://app.lobehub.com/f/fle_x' },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual(['fle_x']);
  });

  it('ignores URLs that do not match the proxy pattern', () => {
    const json = {
      root: {
        children: [
          {
            type: 'block-image',
            src: 'https://cdn.example.com/random.png',
          },
          {
            type: 'block-image',
            src: 'https://app.lobehub.com/some-other-path',
          },
          // Valid one mixed in
          {
            type: 'block-image',
            src: 'https://app.lobehub.com/f/fle_valid',
          },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual(['fle_valid']);
  });

  it('ignores non-image / non-file nodes even with a src field', () => {
    const json = {
      root: {
        children: [
          {
            type: 'paragraph',
            // imagine some hypothetical node that has a src but isn't an image
            src: 'https://app.lobehub.com/f/fle_should_not_match',
          },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual([]);
  });

  it('handles missing children arrays gracefully', () => {
    const json = {
      root: {
        children: [
          { type: 'paragraph' }, // no children
          { type: 'block-image', src: 'https://app.lobehub.com/f/fle_a' },
        ],
      },
    };
    expect(extractFileIdsFromEditorData(json)).toEqual(['fle_a']);
  });
});
