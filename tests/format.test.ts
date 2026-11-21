import test from "node:test";
import assert from "node:assert/strict";
import { siteTodayIso, formatKickoff } from "../lib/format";

test("siteTodayIso rolls over at Hong Kong midnight, not UTC", () => {
  // 20:00 UTC on the 21st is 04:00 HKT on the 22nd.
  assert.equal(siteTodayIso(new Date("2026-11-21T20:00:00Z")), "2026-11-22");
  // 10:00 UTC on the 21st is still the 21st in HKT.
  assert.equal(siteTodayIso(new Date("2026-11-21T10:00:00Z")), "2026-11-21");
});

test("formatKickoff renders in HKT", () => {
  // 12:30 UTC is 20:30 HKT the same day.
  assert.equal(formatKickoff("2026-11-21T12:30:00Z"), "20:30");
});
