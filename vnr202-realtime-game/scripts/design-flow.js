// playwright-cli run-code --filename scripts/design-flow.js
// Run isolated ui-fixture.js with QA_PLAYERS=49. No production credentials.
async (page) => {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3101/?mode=host");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("heading", { name: "Dấu mốc độc lập", exact: true })
    .waitFor();
  assert(
    await page
      .locator(".archive-photo img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    "Archive photograph failed to load",
  );
  assert(
    await page
      .locator(".brand-icon")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    "Logo failed to load",
  );
  await page.screenshot({
    path: "output/playwright/design-entry-laptop.png",
    fullPage: true,
  });
  await page
    .getByLabel("Tên host", { exact: true })
    .fill("Host kiểm thử 9 đội");
  await page
    .getByLabel("Khóa host", { exact: true })
    .fill("local-browser-fixture-only");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .locator('option[value="9"]')
    .waitFor({ state: "attached" });
  const values = await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .locator("option")
    .evaluateAll((els) => els.map((el) => el.value));
  assert(
    values.join(",") === "1,2,3,4,5,6,7,8,9",
    "Team dropdown does not offer exactly 1..9",
  );
  await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .selectOption("1");
  await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .selectOption("9");
  await page
    .getByRole("checkbox", { name: /Tôi đã kiểm tra nội dung/ })
    .check();
  await page.getByRole("button", { name: "Tạo phòng", exact: true }).click();
  await page
    .getByText("49 người · 49 sẵn sàng · 9 đội", { exact: true })
    .waitFor();
  const code = (await page.locator(".room-code").innerText()).trim();
  const player = await page.context().newPage();
  player.on("pageerror", (e) => errors.push(e.message));
  await player.setViewportSize({ width: 390, height: 844 });
  await player.goto(`http://127.0.0.1:3101/?room=${code}`);
  await player
    .getByRole("combobox", { name: "Đội tham gia", exact: true })
    .locator('option[value="8"]')
    .waitFor({ state: "attached" });
  const name = player.getByRole("textbox", {
    name: "Tên của bạn",
    exact: true,
  });
  await name.fill("  MINH   ANH  ");
  assert(
    await name.evaluate((el) => !el.checkValidity()),
    "Duplicate name not marked invalid",
  );
  assert(
    (await player.locator("#name-hint").innerText()).includes("đã có"),
    "Duplicate name lacks clear feedback",
  );
  await name.fill("Minh Anh SE1819");
  assert(
    await name.evaluate((el) => el.checkValidity()),
    "Unique name still marked invalid",
  );
  await player
    .getByRole("combobox", { name: "Đội tham gia", exact: true })
    .selectOption("8");
  for (const width of [320, 390, 768]) {
    await player.setViewportSize({ width, height: 900 });
    assert(
      await player.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Entry overflow at ${width}`,
    );
    await player.screenshot({
      path: `output/playwright/design-entry-${width}.png`,
      fullPage: true,
    });
  }
  await player.getByRole("checkbox").check();
  await player
    .getByRole("button", { name: "Tham gia đội", exact: true })
    .click();
  await player
    .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
    .click();
  const screen = await page.context().newPage();
  await screen.setViewportSize({ width: 1920, height: 1080 });
  await screen.goto(`http://127.0.0.1:3101/?mode=screen&room=${code}`);
  await screen.locator(".team-card").first().waitFor();
  assert(
    (await screen.locator(".teams-grid .member-name").count()) === 50,
    "Projector must show all 50 names",
  );
  assert(
    (await screen.locator(".team-card").count()) === 9,
    "Projector must show nine teams",
  );
  await page.getByRole("button", { name: "Bắt đầu trận", exact: true }).click();
  await screen.getByText("9/9 đội còn sống", { exact: true }).waitFor();
  const board = await screen.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: innerHeight,
    width: document.documentElement.scrollWidth,
  }));
  await screen.screenshot({
    path: "output/playwright/design-nine-teams-50.png",
    fullPage: true,
  });
  assert(
    board.height <= 1080 && board.width <= 1920,
    `Nine-team board overflow: ${JSON.stringify(board)}`,
  );
  assert(errors.length === 0, errors.join("; "));
  await player.close();
  await screen.close();
  return {
    result: "PASS",
    teamOptions: values,
    duplicateNameFeedback: "PASS",
    players: 50,
    teams: 9,
    board,
    pageErrors: errors,
  };
}
