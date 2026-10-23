// Reuses the existing 50 browser participants after a failed QA run.
async (page) => {
  const players = page
    .context()
    .pages()
    .filter((p) => p.url().includes("qa-player="));
  const screen = page
    .context()
    .pages()
    .find((p) => p.url().includes("mode=screen"));
  await page
    .getByRole("button", { name: "Hủy toàn trận có lỗi", exact: true })
    .click();
  await page
    .getByLabel("Lý do", { exact: true })
    .fill("Chạy lại kiểm thử 50 giao diện sau sửa bố cục màn chiếu");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu trận", exact: true })
    .waitFor();
  await screen.reload();
  for (let i = 0; i < players.length; i += 10)
    await Promise.all(
      players.slice(i, i + 10).map(async (p) => {
        await p.reload();
        await p
          .getByRole("button", { name: "Tôi đã sẵn sàng", exact: true })
          .click();
        await p
          .getByRole("button", {
            name: "✓ Đã sẵn sàng — bấm để hủy",
            exact: true,
          })
          .waitFor();
      }),
    );
  await page
    .getByText("50 người · 50 sẵn sàng · 8 đội", { exact: true })
    .waitFor();
  return { result: "PASS", reusedBrowserPlayers: players.length, ready: 50 };
}
