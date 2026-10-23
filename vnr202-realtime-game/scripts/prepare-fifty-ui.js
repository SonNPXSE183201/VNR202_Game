// Creates QA code only in ignored output/. Never publishes the answer bank.
const fs = require("node:fs");
const path = require("node:path");
const bank = require("../src/questions");
const powers = process.argv.includes("--powers");
const source = fs.readFileSync(
  path.join(
    __dirname,
    powers ? "fifty-ui-powers.template.js" : "fifty-ui-play.template.js",
  ),
  "utf8",
);
const answers = Object.fromEntries(
  bank.map((q) => [q.question, q.options[q.correct]]),
);
fs.mkdirSync(path.join(__dirname, "../output"), { recursive: true });
fs.writeFileSync(
  path.join(
    __dirname,
    powers ? "../output/fifty-ui-powers.js" : "../output/fifty-ui-play.js",
  ),
  source.replace("/* QA_ANSWERS */ {}", JSON.stringify(answers)),
);
console.log(
  "Prepared output/fifty-ui-play.js for the isolated browser-only QA server.",
);
