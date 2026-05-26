/**
 * Walks a serialized Lexical editor state and collects the fileIds referenced
 * by image / file nodes. Used by the Task pipeline to derive the list of
 * attachments to hand to `execAgent.fileIds` at run time, so no separate
 * junction table or denormalized column is needed.
 *
 * The function relies on the proxy URL contract from
 * `src/server/routers/lambda/file.ts`:
 *
 *     getFileProxyUrl(fileId) = `${APP_URL}/f/${fileId}`
 *
 * Every uploaded file's `url` ends in `/f/{fileId}`, so the fileId is
 * recoverable by regex without an external URL→fileId mapping.
 *
 * Pure JSON function — no editor instance, no IO. Safe to run server-side.
 */

const FILE_PROXY_RE = /\/f\/(fle_[\w-]+)/;
const IMAGE_NODE_TYPES = new Set(['image', 'block-image', 'inline-image']);
const FILE_NODE_TYPE = 'file';

interface SerializedNode {
  children?: SerializedNode[];
  fileUrl?: string;
  src?: string;
  type?: string;
}

interface SerializedEditorJson {
  root?: SerializedNode;
}

export function extractFileIdsFromEditorData(json: unknown): string[] {
  const root = (json as SerializedEditorJson | undefined)?.root;
  if (!root) return [];

  const seen = new Set<string>();

  const visit = (node: SerializedNode | undefined): void => {
    if (!node || typeof node !== 'object') return;

    const url =
      node.type && IMAGE_NODE_TYPES.has(node.type)
        ? node.src
        : node.type === FILE_NODE_TYPE
          ? node.fileUrl
          : undefined;

    if (url) {
      const match = url.match(FILE_PROXY_RE);
      if (match) seen.add(match[1]);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child);
    }
  };

  visit(root);
  return [...seen];
}
