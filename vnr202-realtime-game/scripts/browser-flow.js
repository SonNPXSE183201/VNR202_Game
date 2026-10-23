// Executed by: playwright-cli run-code --filename scripts/browser-flow.js
// Requires scripts/ui-fixture.js on loopback:3101. This file never runs in npm start.
async (page) => {
  const errors = [];
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:3101/?mode=host");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("textbox", { name: "Tên host", exact: true })
    .fill("Host kiểm thử giao diện");
  await page
    .getByRole("textbox", { name: "Khóa host", exact: true })
    .fill("local-browser-fixture-only");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Thời gian khởi đầu" })
    .selectOption("180");
  await page
    .getByRole("combobox", { name: "Giới hạn trận" })
    .selectOption("330");
  await page.getByRole("button", { name: "Bỏ chọn", exact: true }).click();
  await page.getByRole("checkbox", { name: /Câu 1\./ }).check();
  await page
    .getByRole("checkbox", { name: /Tôi đã kiểm tra nội dung/ })
    .check();
  await page.getByRole("button", { name: "Tạo phòng", exact: true }).click();
  await page.locator(".room-code").waitFor();
  const code = (await page.locator(".room-code").innerText()).trim();
  await page
    .getByText("31 người · 31 sẵn sàng · 8 đội", { exact: true })
    .waitFor();
  await page
    .getByRole("combobox", { name: "Thời gian khởi đầu" })
    .selectOption("240");
  await page
    .getByRole("button", { name: "Lưu cấu hình và bộ câu hỏi", exact: true })
    .click();
  await page
    .getByText("Đã lưu thời gian bom và bộ câu hỏi.", { exact: true })
    .waitFor();

  const player = await page.context().newPage();
  player.on("pageerror", (error) => errors.push(error.message));
  await player.setViewportSize({ width: 390, height: 844 });
  await player.goto(`http://127.0.0.1:3101/?room=${code}`);
  const playerName = "Minh <b>QA</b>";
  await player
    .getByRole("textbox", { name: "Tên của bạn", exact: true })
    .fill(playerName);
  await player.getByRole("button", { name: "Robot", exact: true }).click();
  await player
    .getByRole("combobox", { name: "Đội tham gia", exact: true })
    .selectOption("7");
  await player.getByRole("checkbox").check();
  await player
    .getByRole("button", { name: "Tham gia đội", exact: true })
    .click();
  await player
    .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
    .click();
  assert(
    (await player.locator(".member-name b").count()) === 0,
    "Player name was interpreted as HTML.",
  );
  await player.screenshot({ path: "output/playwright/flow-player-lobby.png" });

  const screen = await page.context().newPage();
  screen.on("pageerror", (error) => errors.push(error.message));
  await screen.setViewportSize({ width: 1920, height: 1080 });
  await screen.goto(`http://127.0.0.1:3101/?mode=screen&room=${code}`);
  await screen.locator(".team-card").first().waitFor();
  assert(
    (await screen.locator(".teams-grid .member-name").count()) === 32,
    "Projector did not show all players.",
  );
  assert(
    (await screen.locator(".log-list,.team-detail").count()) === 0,
    "Private UI leaked to projector.",
  );
  await screen.screenshot({
    path: "output/playwright/flow-projector-lobby.png",
  });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: "output/playwright/flow-host-laptop.png" });
  await page.getByRole("button", { name: "Bắt đầu trận", exact: true }).click();
  await player
    .getByText("Đến lượt bạn giữ bom!", { exact: true })
    .waitFor({ timeout: 16000 });
  const oldQuestion = await player.locator(".question-panel").innerText();
  await player
    .getByRole("button")
    .filter({ hasText: "Nước sôi lửa bỏng" })
    .click();
  await player.getByRole("button", { name: "Trả lời", exact: true }).click();
  await player
    .getByText("Bạn có thể góp ý; chỉ người giữ bom gửi đáp án.", {
      exact: true,
    })
    .waitFor();
  assert(
    (await player.locator(".question-panel").innerText()) !== oldQuestion,
    "Wrong answer did not move turn.",
  );
  await player.screenshot({ path: "output/playwright/flow-player-wrong.png" });
  await page
    .getByRole("button", { name: "Tạm dừng mọi đồng hồ", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tiếp tục trận", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Tiếp tục trận", exact: true })
    .click();
  await player
    .getByText("Đến lượt bạn giữ bom!", { exact: true })
    .waitFor({ timeout: 16000 });
  await player
    .getByRole("button")
    .filter({ hasText: "Ngàn cân treo sợi tóc" })
    .click();
  await player.getByRole("button", { name: "Trả lời", exact: true }).click();
  await player
    .getByText("Bạn có thể góp ý; chỉ người giữ bom gửi đáp án.", {
      exact: true,
    })
    .waitFor();
  await player.reload();
  await player.locator(".player-heading .member-name").waitFor();
  assert(
    (await player.locator(".player-heading .member-name").innerText()).includes(
      playerName,
    ),
    "Reload lost player identity.",
  );
  await player.screenshot({
    path: "output/playwright/flow-player-question.png",
  });
  await screen.screenshot({
    path: "output/playwright/flow-projector-playing.png",
  });
  const board = await screen.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: innerHeight,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  assert(
    !board.overflow && board.height <= board.viewport,
    "Balanced team projector view does not fit 1080p.",
  );
  await page.setViewportSize({ width: 768, height: 1024 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Host tablet horizontal overflow.",
  );
  await page.screenshot({ path: "output/playwright/flow-host-tablet.png" });
  await player.setViewportSize({ width: 320, height: 740 });
  assert(
    await player.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Player small mobile horizontal overflow.",
  );
  await player.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Kết thúc sớm", exact: true }).click();
  await page.getByLabel("Lý do").fill("Kết thúc kịch bản kiểm thử giao diện");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("heading", { name: "Kết quả sinh tồn", exact: true })
    .waitFor();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Xuất log CSV", exact: true }).click(),
  ]);
  await download.saveAs("output/flow-browser-log.csv");
  await screen.screenshot({
    path: "output/playwright/flow-projector-results.png",
  });
  assert(errors.length === 0, `Browser errors: ${errors.join("; ")}`);
  await player.close();
  await screen.close();
  return {
    result: "PASS",
    playersShown: 32,
    teams: 8,
    hostConfiguration: "PASS",
    avatarAndJoin: "PASS",
    escapedName: "PASS",
    singleAttemptWrongThenCorrectNextTurn: "PASS",
    reloadSession: "PASS",
    pauseResume: "PASS",
    projector1080p: board,
    mobileAndTabletOverflow: "NONE",
    csvExport: "PASS",
    pageErrors: errors,
  };
}
