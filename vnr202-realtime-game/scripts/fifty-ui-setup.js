// Run using playwright-cli run-code --filename scripts/fifty-ui-setup.js.
// Requires ui-browser-server.js, which prejoins ZERO participants.
async (page) => {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const started = Date.now();
  await page.goto("http://127.0.0.1:3102/?mode=host");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByLabel("Tên host", { exact: true })
    .fill("Host 50 trình duyệt QA");
  await page
    .getByLabel("Khóa host", { exact: true })
    .fill("local-fifty-browser-only");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .selectOption("8");
  await page
    .getByRole("checkbox", { name: /Tôi đã kiểm tra nội dung/ })
    .check();
  await page.getByRole("button", { name: "Tạo phòng", exact: true }).click();
  await page.locator(".room-code").waitFor();
  const code = (await page.locator(".room-code").innerText()).trim();
  const results = [];
  for (let batch = 0; batch < 50; batch += 5) {
    await Promise.all(
      Array.from({ length: Math.min(5, 50 - batch) }, async (_, j) => {
        const i = batch + j;
        const p = await page.context().newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(e.message));
        const width = i % 10 === 0 ? 1366 : 390;
        await p.setViewportSize({ width, height: 844 });
        await p.goto(`http://127.0.0.1:3102/?room=${code}&qa-player=${i + 1}`);
        const name = `Người QA ${String(i + 1).padStart(2, "0")}`;
        await p
          .getByRole("textbox", { name: "Tên của bạn", exact: true })
          .fill(name);
        await p
          .locator("[data-avatar-choice]")
          .nth(i % 12)
          .click();
        await p
          .getByRole("combobox", { name: "Đội tham gia", exact: true })
          .selectOption(String(i % 8));
        await p.getByRole("checkbox").check();
        await p
          .getByRole("button", { name: "Tham gia đội", exact: true })
          .click();
        await p
          .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
          .click();
        await p
          .getByRole("button", {
            name: "✓ Đã sẵn sàng — bấm để hủy",
            exact: true,
          })
          .waitFor();
        assert(errors.length === 0, `${name}: ${errors.join("; ")}`);
        results.push({
          number: i + 1,
          name,
          team: (i % 8) + 1,
          viewport: width,
        });
      }),
    );
  }
  await page
    .getByText("50 người · 50 sẵn sàng · 8 đội", { exact: true })
    .waitFor();
  const screen = await page.context().newPage();
  await screen.setViewportSize({ width: 1920, height: 1080 });
  await screen.goto(`http://127.0.0.1:3102/?mode=screen&room=${code}`);
  await screen.locator(".team-card").first().waitFor();
  assert(
    (await screen.locator(".teams-grid .member-name").count()) === 50,
    "Projector missing participants",
  );
  assert(
    (await screen.locator(".team-card").count()) === 8,
    "Projector missing teams",
  );
  await screen.screenshot({
    path: "output/playwright/fifty-ui-lobby.png",
    fullPage: true,
  });
  await page.screenshot({
    path: "output/playwright/fifty-ui-host.png",
    fullPage: true,
  });
  const players = page
    .context()
    .pages()
    .filter((p) => p.url().includes("qa-player="));
  assert(players.length === 50, "Not exactly 50 browser participants");
  await players[0].screenshot({
    path: "output/playwright/fifty-ui-player-lobby.png",
  });
  return {
    result: "PASS",
    code,
    joinedViaUI: results.length,
    ready: 50,
    teams: 8,
    teamSizes: Array.from(
      { length: 8 },
      (_, i) => results.filter((p) => p.team === i + 1).length,
    ),
    browserTabs: page.context().pages().length,
    elapsedMs: Date.now() - started,
    players: results.sort((a, b) => a.number - b.number),
  };
}
