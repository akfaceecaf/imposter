import { uuidv4 } from "uuidv7";

export const randomID = () => uuidv4();

export const getRandomIdx = (arr) => {
  return Math.floor(Math.random() * arr.length);
};
