import { test } from "node:test";
import assert from "node:assert/strict";
import { startupErrorMessage } from "./startupError.js";

test("Atlas DNS failures explain how to repair configuration", () => {
  const message = startupErrorMessage({ code: "ENOTFOUND", syscall: "querySrv" });
  assert.match(message, /Atlas cluster is active/);
  assert.match(message, /server\/\.env/);
});

test("connection and authentication failures have specific guidance", () => {
  assert.match(startupErrorMessage({ name: "MongooseServerSelectionError" }), /IP access list/);
  assert.match(startupErrorMessage({ code: 18 }), /username and password/);
});

test("startup diagnostics do not expose driver messages containing credentials", () => {
  const secret = "mongodb+srv://user:secret@example.com/db";
  for (const details of [{}, { code: 18 }, { code: "ENOTFOUND", syscall: "querySrv" }]) {
    assert.ok(!startupErrorMessage({ ...details, message: secret }).includes(secret));
  }
});
