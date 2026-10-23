// Local QA only: ui-fixture.js. No production credentials.
// playwright-cli run-code --filename scripts/dropdown-flow.js
async (page) => {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  await page.goto("http://127.0.0.1:3101/?mode=host");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.getByLabel("Tên host", { exact: true }).fill("Host dropdown QA");
  await page
    .getByLabel("Khóa host", { exact: true })
    .fill("local-browser-fixture-only");
  await page
    .getByRole("button", { name: "Mở cấu hình phòng", exact: true })
    .click();
  const select = page.getByRole("combobox", { name: "Số đội", exact: true });
  await select.waitFor();
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert(
    await select.evaluate(
      (el) => getComputedStyle(el).appearance === "base-select",
    ),
    "Custom popup style not applied",
  );
  await select.click();
  assert(
    await select.evaluate((el) => el.matches(":open")),
    "Picker did not open",
  );
  const style = await select.evaluate((el) => ({
    radius: getComputedStyle(el, "::picker(select)").borderRadius,
    selectedColor: getComputedStyle(el.selectedOptions[0]).color,
  }));
  assert(style.radius === "12px", "Picker has no themed border radius");
  assert(
    style.selectedColor === "rgb(150, 47, 53)",
    "Selected option does not use brand color",
  );
  await page.screenshot({ path: "output/playwright/dropdown-desktop.png" });
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  assert(
    (await select.inputValue()) === "9",
    "Keyboard selection did not update value",
  );
  await select.click();
  await page.keyboard.press("Escape");
  assert((await select.inputValue()) === "9", "Escape changed selection");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await select.click();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${width}`,
    );
    await page.screenshot({ path: `output/playwright/dropdown-${width}.png` });
    await page.keyboard.press("Escape");
  }
  await page.emulateMedia({ forcedColors: "active" });
  assert(
    await select.evaluate((el) => getComputedStyle(el).appearance === "auto"),
    "Forced colors fallback missing",
  );
  await page.emulateMedia({ forcedColors: "none" });
  return {
    result: "PASS",
    keyboard: "PASS",
    escape: "PASS",
    viewports: [320, 390, 768, 1440],
    forcedColors: "PASS",
    style,
  };
}
