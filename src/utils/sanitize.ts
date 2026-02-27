import xss from "xss";

export function cleanText(input: string): string {
  return xss(input).trim();
}