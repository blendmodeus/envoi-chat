import { t } from 'i18next';

import { BRANDING_LOGO_URL } from '@lobechat/business-const';

import { DEFAULT_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_LOBE_SESSION } from '@/const/session';
import { type MetaData } from '@/types/meta';
import {
  type LobeAgentSession,
  type LobeGroupSession,
  type LobeSession,
  type LobeSessions,
} from '@/types/session';

export const getSessionPinned = (session: LobeSession) => session.pinned;

const sanitizeAvatar = (avatar?: string): string => {
  if (!avatar) return DEFAULT_AVATAR;
  if (avatar.startsWith('/avatars/')) {
    if (avatar.includes('lobe-ai')) return BRANDING_LOGO_URL || '🤖';
    if (avatar.includes('doc-copilot')) return '📄';
    if (avatar.includes('agent-builder')) return '🛠️';
    if (avatar.includes('agent-default')) return '🤖';
    return BRANDING_LOGO_URL || '🤖';
  }
  return avatar;
};

const getAvatar = (s: MetaData) => sanitizeAvatar(s.avatar || DEFAULT_AVATAR);
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });

const getSessionById = (
  id: string,
  sessions: LobeSessions,
): LobeAgentSession | LobeGroupSession => {
  const session = sessions.find((s) => s.id === id);

  if (!session) return DEFAULT_AGENT_LOBE_SESSION;

  return session;
};

export const sessionHelpers = {
  getAvatar,
  getSessionById,
  getSessionPinned,
  getTitle,
};
