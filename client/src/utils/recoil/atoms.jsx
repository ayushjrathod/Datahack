import { atom } from "recoil";

export const userState = atom({
  key: "userState",
  default: {
    name: "John Doe",
    age: 25,
  },
});

export const currentPhaseState = atom({
  key: "currentPhaseState",
  default: 1,
});

export const answersState = atom({
  key: "answersState",
  default: {},
});

export const currentQuestionsState = atom({
  key: "currentQuestionsState",
  default: [],
});

export const progressState = atom({
  key: "progressState",
  default: 0,
});

export const fileDataState = atom({
  key: "fileDataState",
  default: null,
});
