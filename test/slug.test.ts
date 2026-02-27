import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/utils/slug.js";

test("slugify basic", () => {
  assert.equal(slugify("Hello World!"), "hello-world");
});

test("slugify trims and collapses", () => {
  assert.equal(slugify("  A   B   C  "), "a-b-c");
});