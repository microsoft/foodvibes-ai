import { EscapeHtml } from "./commonFunctions";

test("EscapeHtml encodes HTML text and attributes", () => {
    const escaped = EscapeHtml(`"><img src=x onerror='alert(1)'>&`);

    expect(escaped).toBe(
        "&quot;&gt;&lt;img src=x onerror=&#39;alert(1)&#39;&gt;&amp;",
    );
});
