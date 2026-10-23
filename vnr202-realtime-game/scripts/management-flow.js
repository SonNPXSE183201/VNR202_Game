// Local QA only: ui-fixture.js with its default 31 bots.
// playwright-cli run-code --filename scripts/management-flow.js
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
  await page.getByLabel("Tên host", { exact: true }).fill("Host quản lý QA");
  await page
    .getByLabel("Khóa host", { exact: true })
    .fill("incorrect-qa-key-12345");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  await page.locator("#host-error").filter({ hasText: /./ }).waitFor();
  await page
    .getByLabel("Khóa host", { exact: true })
    .fill("local-browser-fixture-only");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Số đội", exact: true })
    .selectOption("2");
  await page
    .getByRole("checkbox", { name: /Tôi đã kiểm tra nội dung/ })
    .check();
  await page.getByRole("button", { name: "Tạo phòng", exact: true }).click();
  await page
    .getByText("31 người · 31 sẵn sàng · 2 đội", { exact: true })
    .waitFor();
  const code = (await page.locator(".room-code").innerText()).trim();
  const player = await page.context().newPage();
  player.on("pageerror", (e) => errors.push(e.message));
  await player.goto(`http://127.0.0.1:3101/?room=${code}`);
  await player
    .getByRole("textbox", { name: "Tên của bạn", exact: true })
    .fill("Người QA quản lý");
  await player
    .getByRole("combobox", { name: "Đội tham gia", exact: true })
    .selectOption("0");
  await player.getByRole("checkbox").check();
  await player
    .getByRole("button", { name: "Tham gia đội", exact: true })
    .click();
  await player.getByText("Sửa avatar, tên hoặc đội", { exact: true }).click();
  await player.locator("#profile-name").fill("Người QA đổi tên");
  await player.locator("#profile-avatar").selectOption("8");
  await player.locator("#profile-team").selectOption("1");
  await player.getByRole("button", { name: "Lưu hồ sơ", exact: true }).click();
  await player
    .locator(".player-heading")
    .filter({ hasText: "Người QA đổi tên" })
    .waitFor();
  await page.getByText("Quản lý đội và thành viên", { exact: true }).click();
  await page.locator("#team-name-1").fill("Nhóm Sao Việt");
  await page.locator('[data-rename="1"]').click();
  await player
    .locator(".player-heading")
    .filter({ hasText: "Nhóm Sao Việt" })
    .waitFor();
  const row = page
    .locator(".edit-member")
    .filter({ has: page.locator('input[value="Người QA đổi tên"]') });
  await row.getByRole("textbox").fill("Minh Anh");
  await row.getByRole("button", { name: "Lưu", exact: true }).click();
  await page.locator("#toast").filter({ hasText: "Tên này đã có" }).waitFor();
  await row.getByRole("textbox").fill("Người QA do host đổi");
  await row.getByRole("combobox").selectOption("0");
  await row.getByRole("button", { name: "Lưu", exact: true }).click();
  await player
    .locator(".player-heading")
    .filter({ hasText: "Người QA do host đổi" })
    .waitFor();
  const temporary = await page.context().newPage();
  await temporary.goto(`http://127.0.0.1:3101/?room=${code}`);
  await temporary
    .getByRole("textbox", { name: "Tên của bạn", exact: true })
    .fill("Người QA xóa khỏi phòng");
  await temporary
    .getByRole("combobox", { name: "Đội tham gia", exact: true })
    .selectOption("0");
  await temporary.getByRole("checkbox").check();
  await temporary
    .getByRole("button", { name: "Tham gia đội", exact: true })
    .click();
  await temporary
    .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
    .waitFor();
  const removedRow = page
    .locator(".edit-member")
    .filter({ has: page.locator('input[value="Người QA xóa khỏi phòng"]') });
  await removedRow
    .getByRole("button", { name: "Xóa khỏi phòng", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await removedRow.waitFor({ state: "detached" });
  await temporary.close();
  await page
    .getByRole("button", { name: "Khóa danh sách", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mở khóa danh sách", exact: true })
    .waitFor();
  const lockedEntry = await page.context().newPage();
  await lockedEntry.goto(`http://127.0.0.1:3101/?room=${code}`);
  await lockedEntry
    .locator("#join-error")
    .filter({ hasText: "Phòng đã khóa" })
    .waitFor();
  assert(
    await lockedEntry.locator("#join-submit").isDisabled(),
    "Locked room permits joining",
  );
  await lockedEntry.close();
  await player.reload();
  assert(
    (await player.locator("#profile-form").count()) === 0,
    "Locked room still allows profile edits",
  );
  await page
    .getByRole("button", { name: "Mở khóa danh sách", exact: true })
    .click();
  await player
    .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Lọc log theo đội", exact: true })
    .selectOption("0");
  await page
    .getByRole("combobox", { name: "Lọc loại log", exact: true })
    .selectOption("connection");
  await page
    .getByRole("combobox", { name: "Lọc loại log", exact: true })
    .selectOption("");
  await page
    .getByRole("combobox", { name: "Lọc log theo đội", exact: true })
    .selectOption("");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Mời host giám sát", exact: true })
    .click();
  await page
    .locator("#toast")
    .filter({ hasText: "Đã sao chép link giám sát" })
    .waitFor();
  const observerUrl = await page.evaluate(() => navigator.clipboard.readText());
  const observer = await page.context().newPage();
  await observer.goto(observerUrl);
  await observer.locator(".log-panel").waitFor();
  assert(
    (await observer
      .locator('[data-action="start"],[data-action="pause"],#room-config')
      .count()) === 0,
    "Observer has host controls",
  );
  assert(!new URL(observer.url()).hash, "Observer secret remained in address");
  await page.getByRole("button", { name: "Bắt đầu trận", exact: true }).click();
  await page
    .getByRole("button", { name: "Tạm dừng mọi đồng hồ", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hủy toàn trận có lỗi", exact: true })
    .click();
  await page
    .getByLabel("Lý do", { exact: true })
    .fill("Hủy để kiểm tra phục hồi về phòng chờ");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu trận", exact: true })
    .waitFor();
  await page
    .getByText("32 người · 0 sẵn sàng · 2 đội", { exact: true })
    .waitFor();
  await page
    .getByRole("button", {
      name: "Bắt đầu ngay (bỏ qua sẵn sàng)",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.getByRole("button", { name: "Kết thúc sớm", exact: true }).click();
  await page
    .getByLabel("Lý do", { exact: true })
    .fill("Kết thúc kiểm tra quản lý phòng");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("heading", { name: "Kết quả sinh tồn", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Tạo phòng mới", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .waitFor();
  assert(errors.length === 0, errors.join("; "));
  await player.close();
  await observer.close();
  return {
    result: "PASS",
    authError: "PASS",
    profileAndHostRename: "PASS",
    duplicateRename: "PASS",
    removePlayer: "PASS",
    roomLock: "PASS",
    logFilters: "PASS",
    observerPermissions: "PASS",
    cancelAndForceRestart: "PASS",
    newRoom: "PASS",
    pageErrors: errors,
  };
}
