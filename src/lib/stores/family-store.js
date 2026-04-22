import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ─────────────────────────────────────────────
// TODO: Replace mock family with:
//   const { data } = await convex.query(api.family.listByOwner, { userId })
// TODO: addMember → convex.mutation(api.family.add, { ...member, userId })
// TODO: removeMember → convex.mutation(api.family.remove, { memberId })
// TODO: Each family member links to their own profile record via linked_user_id
// ─────────────────────────────────────────────────────────────────────────────

let memberId = 100;

export const useFamilyStore = create((set) => ({
  members: [],

  addMember: (member) =>
    set((state) => ({
      members: [
        ...state.members,
        {
          ...member,
          id: `fam-${++memberId}`,
          isSelf: false,
          avatarGradient: AVATAR_GRADIENTS[memberId % AVATAR_GRADIENTS.length],
          healthScore: null,
          medicationCount: 0,
          recordCount: 0,
        },
      ],
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),
}));

// Cycle of avatar gradient options for new members
export const AVATAR_GRADIENTS = [
  ["#0D6E4F", "#00C9A7"],
  ["#7C3AED", "#C084FC"],
  ["#1D4ED8", "#60A5FA"],
  ["#B45309", "#FCD34D"],
  ["#BE123C", "#FB7185"],
  ["#047857", "#34D399"],
];

export const RELATION_OPTIONS = [
  "Mother",
  "Father",
  "Spouse",
  "Son",
  "Daughter",
  "Sibling",
  "Other",
];
