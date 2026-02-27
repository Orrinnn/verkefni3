import test from "node:test";
import assert from "node:assert/strict";
import { parsePaging } from "../src/utils/paging.js";

test("parsePaging defaults", () => {
  assert.deepEqual(parsePaging({}), { limit: 10, offset: 0 });
});

test("parsePaging clamps", () => {
  assert.deepEqual(parsePaging({ limit: "9999", offset: "-5" }), { limit: 100, offset: 0 });
});