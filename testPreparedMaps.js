const { walk, Grid, DIRS, OPP , chooseStartDirection} = require("./pathFollower");

// tiny test runner
function test(name, fn) {
  try {
    fn();
    console.log(`✔ ${name}`);
  } catch (e) {
    console.error(`✖ ${name}:`, e.message);
    throw e;
  }
}

// collection of maps with no error
function runAcceptanceTests() {
  const MAPS = {
    basic: [
      "  @---A---+",
      "          |",
      "  x-B-+   C",
      "      |   |",
      "      +---+",
    ],
    intersections: [
      "  @",
      "  | +-C--+",
      "  A |    |",
      "  +---B--+",
      "    |      x",
      "    |      |",
      "    +---D--+",
    ],
    letterTurns: [
      "  @---A---+",
      "          |",
      "  x-B-+   |",
      "      |   |",
      "      +---C",
    ],
    noDoubleCollect: [
      "     +-O-N-+",
      "     |     |",
      "     |   +-I-+",
      " @-G-O-+ | | |",
      "     | | +-+ E",
      "     +-+     S",
      "             |",
      "             x",
    ],
    compact: [
      " +-L-+",
      " |  +A-+",
      "@B+ ++ H",
      " ++    x",
    ],
    ignoreAfterEnd: [
      "  @-A--+",
      "       |",
      "       +-B--x-C--D",
    ],
    custom: [
      "@",
      "|",
      "-",
      "|",
      "OKx"
    ]
  };

  // run good maps and check if letters and path matches
  const cases = [
    { map: MAPS.basic, letters: "ACB", path: "@---A---+|C|+---+|+-B-x" },
    { map: MAPS.intersections, letters: "ABCD", path: "@|A+---B--+|+--C-+|-||+---D--+|x" },
    { map: MAPS.letterTurns, letters: "ACB", path: "@---A---+|||C---+|+-B-x" },
    { map: MAPS.noDoubleCollect, letters: "GOONIES", path: "@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x" },
    { map: MAPS.compact, letters: "BLAH", path: "@B+++B|+-L-+A+++A-+Hx" },
    { map: MAPS.ignoreAfterEnd, letters: "AB", path: "@-A--+|+-B--x" },
    { map: MAPS.custom, letters: "OK", path: "@|-|OKx" },
  ];

  cases.forEach(({map, letters, path}, i) => {
    test(`Acceptance #${i+1}`, () => {
      const { letters: L, path: P } = walk(map);
      if (L !== letters) throw new Error(`Letters mismatch: got '${L}', expected '${letters}'`);
      if (P !== path) throw new Error(`Path mismatch: got '${P}', expected '${path}'`);
    });
  });
}

// test maps with errors
function runInvalidMapTests() {
  const bad = [
    { map: [
        "     -A---+",
        "          |",
        "  x-B-+   C",
        "      |   |",
        "      +---+",
      ], msg: "Missing start character '@'" },
    { map: [
        "   @--A---+",
        "          |",
        "    B-+   C",
        "      |   |",
        "      +---+",
      ], msg: "Missing end character 'x'" },
    { map: ["  x-B-@-A-x"], msg: "Multiple starting paths" },
    { map: ["  @-A-+-B-x"], msg: "Fake '+' without perpendicular connection" },
    { map: ["  @-A B-x"], msg: "Fork in path or wrong turn" },
    { map: [
        "   @-A-+",
        "      | ",
        "      | ",
        "      ",  
      ], msg: "Missing end character 'x'" },
    { map: [
        "   @",
        "    ",
        "   x",
      ], msg: "Broken path: no path from start" },
    { map: [
        "   @@-A-x",
      ], msg: "Multiple starts" },
  ];

  bad.forEach(({map, msg}, i) => {
    test(`Error: #${i+1} (${msg})`, () => {
      let threw = false;
      try {
        walk(map);
      } catch (e) {
        threw = true;
      }
      if (!threw) throw new Error("Expected an error but none was thrown");
    });
  });
}

// Example unit test, check if start direction is right
function runUnitTests() {
  test("Start has exactly one outgoing path", () => {
    const map = [" @-A", "   x"];
    //const map = ["x--OK--@"];
    const grid = new Grid(map);
    const { start } = { start: grid.findChar("@")[0] };
    const dir = chooseStartDirection(grid, start.x, start.y);
    if (dir.name !== "RIGHT") throw new Error("Start direction should be RIGHT");
  });
}

function runAllTests() {
  runAcceptanceTests();
  runInvalidMapTests();
  runUnitTests();
}

// Run all tests
runAllTests();
