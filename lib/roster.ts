// Shared shape for reading student rows on the teacher side.
// Never select the whole User row: it carries the password hash.
export const studentSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  totalXP: true,
  createdAt: true,
} as const;
