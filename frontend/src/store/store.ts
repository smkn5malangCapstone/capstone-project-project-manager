import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import createSelectors from "./selectors";
import { UserType } from "@/types/api.type";

type AuthStake = {
  accessToken: string | null;
  user: UserType | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const createAuthSlice: StateCreator<AuthStake> = (set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null}),
});

type StoreType = AuthStake;

export const useStoreBase = create<StoreType>()(
  devtools(
  persist(
      immer((...a) => ({
          ...createAuthSlice(...a),
        })),
      {
        name: "session-storage", 
        getStorage: () => sessionStorage,
      }
    )
  )
);

export const useStore = createSelectors(useStoreBase);