const { test } = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../src/questions");
test("revised bank retains 60 unique four-option questions and PDF references", () => {
  assert.equal(bank.length, 60);
  assert.equal(new Set(bank.map((q) => q.id)).size, 60);
  for (const q of bank) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options[q.correct]);
    assert.ok(q.source.page >= 3 && q.source.page <= 33);
    assert.ok(q.explain.includes("Đối chiếu"));
  }
  assert.match(bank[24].question, /Chính phủ Liên hiệp kháng chiến/);
  assert.match(bank[45].question, /Đại diện phía Pháp/);
  assert.match(
    bank[47].options[bank[47].correct],
    /Liên bang Đông Dương và Liên hiệp Pháp/,
  );
  for (const q of bank)
    for (const [i, o] of q.options.entries())
      if (i !== q.correct)
        assert.ok(
          ![
            "Không có nhân dân ủng hộ",
            "Bỏ qua lợi ích dân tộc",
            "Chính quyền chỉ phục vụ một nhóm người",
            "Chấm dứt hoàn toàn vai trò lãnh đạo",
            "Một tỉnh của Pháp",
          ].includes(o),
        );
});
