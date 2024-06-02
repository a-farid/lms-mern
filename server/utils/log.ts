import { blue, red, green, gray, magenta, bold } from "chalk";

const clog = console.log;

export const log = {
  info: (...messages: string[]) => {
    console.log(blue.bold(messages.join(" ")));
  },
  error: (...messages: string[]) => {
    console.log(red.bold(messages.join(" ")));
  },
  success: (...messages: string[]) => {
    console.log(green.bold(messages.join(" ")));
  },
  warning: (...messages: string[]) => {
    console.log(bold.yellow(messages.join(" ")));
  },
  gray: (...messages: string[]) => {
    console.log(bold.gray(messages.join(" ")));
  },
  magenta: (...messages: string[]) => {
    console.log(bold.magenta(messages.join(" ")));
  },
};
