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
  const usedPowers = [];
  let idleVerified = false;
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
    const remaining = await page.locator("[data-timer]").innerText();
    const parts = remaining.split(":").map(Number);
    if (parts[0] * 60 + parts[1] <= 12) {
      await page
        .getByRole("heading", { name: "Kết quả sinh tồn", exact: true })
        .waitFor({ timeout: 20000 });
      break;
    }
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
              meta: document.querySelector(".question-meta")?.textContent,
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
    assert(
      holders.every((v) => !/Câu\s+\d+/u.test(v.meta || "")),
      "Player question number is still visible",
    );
    for (let i = 0; i < holders.length; i += 8) {
      await Promise.all(
        holders.slice(i, i + 8).map(async (v) => {
          const correctText = expectedAnswers[v.question];
          assert(correctText, `Unknown question: ${v.question}`);
          const correctIndex = v.choices.indexOf(correctText);
          assert(correctIndex >= 0, "Correct option missing in rendered UI");
          const player = Number(
            new URL(v.p.url()).searchParams.get("qa-player"),
          );
          const team = (player - 1) % 8;
          if (team === 7 && Date.now() - started < 35000) return;
          if (team === 7 && !idleVerified) {
            const summary = await page
              .locator('.team-card[data-team="7"] > p.fine')
              .innerText();
            assert(
              /0 câu đúng/.test(summary) && /[1-9]\d* lần sai/.test(summary),
              "Idle team did not receive timeout penalties",
            );
            idleVerified = true;
          }
          let used = null;
          if (team < 3) {
            for (const kind of ["fifty", "star", "transfer"]) {
              if (
                usedPowers.some((p) => p.team === team + 1 && p.kind === kind)
              )
                continue;
              const button = v.p.locator(`[data-power="${kind}"]`);
              if (!(await button.isEnabled())) continue;
              await button.click();
              if (kind === "transfer") {
                await v.p.locator("#transfer-target").selectOption("6");
                await v.p.locator("#transfer-confirm").click();
              }
              await v.p
                .locator(`[data-power="${kind}"]`)
                .filter({ hasText: "Đã dùng" })
                .waitFor({ timeout: 5000 });
              if (kind === "fifty")
                assert(
                  (await v.p.locator(".option:not(:disabled)").count()) === 2,
                  "50/50 did not leave two choices",
                );
              usedPowers.push({ team: team + 1, kind });
              used = kind;
              break;
            }
          }
          // A few intentional wrong answers exercise penalty and one-attempt switching.
          const wrong = used === "star" && team === 2;
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
  await download.saveAs("output/fifty-ui-powers-log.csv");
  assert(
    usedPowers.length === 9,
    "Not all 3 powers used by each of the first 3 teams",
  );
  assert(idleVerified, "Idle-team timeout path not checked");
  for (const t of [3, 4, 5, 6, 7]) {
    const card = await page
      .locator(`.team-card[data-team="${t}"] .team-points`)
      .innerText();
    assert(!card.includes("✓"), "A no-power team unexpectedly used a power");
  }
  const times = answers.map((a) => a.uiAckMs).sort((a, b) => a - b);
  return {
    result: "PASS",
    usedPowers,
    teamsWithoutPowers: 5,
    idleTeamTimeout: idleVerified,
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
