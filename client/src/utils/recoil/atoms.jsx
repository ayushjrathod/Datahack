import { atom } from "recoil";

export const userState = atom({
  key: "userState",
  default: {
    name: "John Doe",
    age: 25,
  },
});
