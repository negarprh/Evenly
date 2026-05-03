import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSplits } from "./splitService.js";

describe("buildSplits", () => {
  it("splits equal amounts and keeps cents balanced", () => {
    const splits = buildSplits({
      amount: 10,
      splitType: "equal",
      participants: ["aaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbbbb", "cccccccccccccccccccccccc"]
    });

    assert.deepEqual(
      splits.map((split) => split.amount),
      [3.34, 3.33, 3.33]
    );
    assert.equal(splits.reduce((sum, split) => sum + Math.round(split.amount * 100), 0), 1000);
  });

  it("accepts custom splits that exactly match the total", () => {
    const splits = buildSplits({
      amount: 27.5,
      splitType: "custom",
      participants: ["aaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbbbb"],
      splits: [
        { user: "aaaaaaaaaaaaaaaaaaaaaaaa", amount: 10 },
        { user: "bbbbbbbbbbbbbbbbbbbbbbbb", amount: 17.5 }
      ]
    });

    assert.deepEqual(
      splits.map((split) => split.amount),
      [10, 17.5]
    );
  });

  it("rejects custom splits that do not match the total", () => {
    assert.throws(
      () =>
        buildSplits({
          amount: 27.5,
          splitType: "custom",
          participants: ["aaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbbbb"],
          splits: [
            { user: "aaaaaaaaaaaaaaaaaaaaaaaa", amount: 10 },
            { user: "bbbbbbbbbbbbbbbbbbbbbbbb", amount: 10 }
          ]
        }),
      /Custom split total must equal expense amount/
    );
  });
});
