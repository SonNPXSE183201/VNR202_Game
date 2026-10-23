// QA template: prepare-fifty-ui.js injects answer text from the server-only
// fixture bank into an ignored local script. All game actions use UI clicks.
async (page) => {
  const expectedAnswers = /* QA_ANSWERS */ {};
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const players = page
    .context()
    .pages()
    .filter((p) => p.url().includes("qa-player="));
  const screen = page
    .context()
    .pages()
    .find((p) => p.url().includes("mode=screen"));
  assert(
    players.length === 50 && screen,
    "Setup must have exactly 50 browser players and a projector",
  );
  const errors = [],
    answers = [],
    screenshots = [];
  for (const p of [page, screen, ...players])
    p.on("pageerror", (e) => errors.push(e.message));
  const started = Date.now();
  await page.getByRole("button", { name: "Bắt đầu trận", exact: true }).click();
  await screen.getByText("8/8 đội còn sống", { exact: true }).waitFor();
  let paused = false,
    reloaded = false,
    round = 0;
  while (Date.now() - started < 390000) {
    if (
      await page
        .getByRole("heading", { name: "Kết quả sinh tồn", exact: true })
        .count()
    )
      break;
    const visible = [];
    // Read rendered UI only; do not read client/session internals or emit socket messages.
    for (let i = 0; i < players.length; i += 10) {
      visible.push(
        ...(await Promise.all(
          players.slice(i, i + 10).map(async (p) => ({
            p,
            ...(await p.evaluate(() => ({
              holder: !!document.querySelector("#answer-submit"),
              question:
                document.querySelector(".question-panel h1")?.textContent,
              choices: Array.from(document.querySelectorAll(".option")).map(
                (el) => el.lastElementChild.textContent,
              ),
              online: document.querySelector("#connection")?.textContent,
            }))),
          })),
        )),
      );
    }
    assert(
      visible.every((v) => v.online.includes("Đã kết nối")),
      "A browser participant disconnected",
    );
    const holders = visible.filter((v) => v.holder);
    for (let i = 0; i < holders.length; i += 4) {
      await Promise.all(
        holders.slice(i, i + 4).map(async (v) => {
          const correctText = expectedAnswers[v.question];
          assert(correctText, `Unknown question: ${v.question}`);
          const correctIndex = v.choices.indexOf(correctText);
          assert(correctIndex >= 0, "Correct option missing in rendered UI");
          const player = Number(
            new URL(v.p.url()).searchParams.get("qa-player"),
          );
          // A few intentional wrong answers exercise penalty and one-attempt switching.
          const wrong = round === 0 && player % 3 === 0;
          const index = wrong ? (correctIndex + 1) % 4 : correctIndex;
          const at = Date.now();
          await v.p.locator(".option").nth(index).click();
          await v.p
            .getByRole("button", { name: "Trả lời", exact: true })
            .click();
          await v.p
            .locator("#answer-submit")
            .waitFor({ state: "detached", timeout: 15000 });
          answers.push({ player, correct: !wrong, uiAckMs: Date.now() - at });
        }),
      );
    }
    round++;
    if (!paused && answers.length >= 50) {
      await page
        .getByRole("button", { name: "Tạm dừng mọi đồng hồ", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Tiếp tục trận", exact: true })
        .waitFor();
      await players[0]
        .getByText("Tất cả đồng hồ đều dừng; không ai được gửi đáp án.", {
          exact: true,
        })
        .waitFor();
      assert(
        (await players[0].locator("#answer-submit").count()) === 0,
        "Answer control remains during pause",
      );
      await screen.screenshot({
        path: "output/playwright/fifty-ui-paused.png",
        fullPage: true,
      });
      await players[0].reload();
      await players[0].locator(".player-heading .member-name").waitFor();
      assert(
        (await players[0].locator(".player-heading").innerText()).includes(
          "Người QA 01",
        ),
        "Reload lost player identity",
      );
      reloaded = true;
      await page
        .getByRole("button", { name: "Tiếp tục trận", exact: true })
        .click();
      paused = true;
    }
    if (round === 3) {
      await screen.screenshot({
        path: "output/playwright/fifty-ui-playing.png",
        fullPage: true,
      });
      const board = await screen.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
      }));
      assert(
        board.height <= 1080 && board.width <= 1920,
        `50-player projector overflow: ${JSON.stringify(board)}`,
      );
      const holder = holders[0]?.p;
      if (holder)
        await holder.screenshot({
          path: "output/playwright/fifty-ui-player-playing.png",
        });
    }
    // A short interval models reading time. Time runs normally on the server.
    await page.waitForTimeout(1500);
  }
  await page
    .getByRole("heading", { name: "Kết quả sinh tồn", exact: true })
    .waitFor({ timeout: 10000 });
  const finalStates = await Promise.all(
    players.map(async (p) => ({
      player: Number(new URL(p.url()).searchParams.get("qa-player")),
      result: await p.getByRole("heading", { name: /Kết quả của/ }).count(),
      online: await p.locator("#connection").innerText(),
    })),
  );
  assert(
    finalStates.every((p) => p.result === 1 && p.online.includes("Đã kết nối")),
    "Not all 50 browsers received final results",
  );
  const participation = new Set(answers.map((a) => a.player));
  assert(
    participation.size === 50,
    `Only ${participation.size}/50 players answered through UI`,
  );
  assert(paused && reloaded, "Pause/reload path was not exercised");
  assert(errors.length === 0, errors.join("; "));
  await screen.screenshot({
    path: "output/playwright/fifty-ui-results.png",
    fullPage: true,
  });
  await players[0].screenshot({
    path: "output/playwright/fifty-ui-player-result.png",
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Xuất log CSV", exact: true }).click(),
  ]);
  await download.saveAs("output/fifty-ui-log.csv");
  const times = answers.map((a) => a.uiAckMs).sort((a, b) => a - b);
  return {
    result: "PASS",
    scope:
      "50 actual browser pages, UI-only join/ready/answer; localhost, not physical devices",
    players: 50,
    teams: 8,
    uniquePlayersAnswering: participation.size,
    answers: answers.length,
    correct: answers.filter((a) => a.correct).length,
    wrong: answers.filter((a) => !a.correct).length,
    rounds: round,
    elapsedMs: Date.now() - started,
    pauseResume: paused,
    reloadSession: reloaded,
    finalResultsReceived: finalStates.filter((s) => s.result === 1).length,
    uiAckMs: {
      p50: times[Math.floor(times.length * 0.5)],
      p95: times[Math.floor(times.length * 0.95)],
      max: times.at(-1),
    },
    pageErrors: errors,
    answersByPlayer: Array.from({ length: 50 }, (_, i) => ({
      player: i + 1,
      answers: answers.filter((a) => a.player === i + 1).length,
    })),
  };
}
