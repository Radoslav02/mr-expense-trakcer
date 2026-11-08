import { createAction, createSlice } from '@reduxjs/toolkit';
import type { AppThunk, RootState } from '@/app/store';
import { getMessages } from '@/i18n';
import { sessionCleared } from '@/redux/auth/authThunks';
import { subscribeToInvitations, subscribeToMyGroups } from '@/services/groupsService';
import type { AsyncStatus } from '@/types/async';
import type { Group } from '@/types/group';

interface GroupsState {
  items: Group[];
  invitations: Group[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: GroupsState = { items: [], invitations: [], status: 'idle', error: null };

export const groupsSynced = createAction<Group[]>('groups/synced');
export const invitationsSynced = createAction<Group[]>('groups/invitationsSynced');
export const groupsSyncFailed = createAction<string>('groups/syncFailed');

export const startGroupsSync =
  (uid: string, email: string | null): AppThunk<() => void> =>
  (dispatch) => {
    const onError = () => dispatch(groupsSyncFailed(getMessages().groups.errors.load));
    const unsubscribes = [
      subscribeToMyGroups(uid, (groups) => dispatch(groupsSynced(groups)), onError),
      ...(email
        ? [subscribeToInvitations(email, (groups) => dispatch(invitationsSynced(groups)), onError)]
        : []),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  };

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialState)
      .addCase(groupsSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload;
      })
      .addCase(invitationsSynced, (state, action) => {
        state.invitations = action.payload;
      })
      .addCase(groupsSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const groupsReducer = groupsSlice.reducer;

export const selectGroups = (state: RootState) => state.groups.items;
export const selectInvitations = (state: RootState) => state.groups.invitations;
export const selectGroupsStatus = (state: RootState) => state.groups.status;
export const selectGroupsError = (state: RootState) => state.groups.error;
export const selectGroupById = (state: RootState, groupId: string | undefined) =>
  state.groups.items.find((group) => group.id === groupId) ?? null;
