// Isolated QA server. No prejoined players or socket bots: every participant
// must use the browser UI. Never loaded by npm start.
const { createApp } = require("../server");
const app = createApp({ hostKey: "local-fifty-browser-only", persist: false });
app.server.listen(3102, "127.0.0.1", () =>
  console.log(
    "Browser-only QA server: http://127.0.0.1:3102 (no players prejoined)",
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => app.close().then(() => process.exit(0)));
