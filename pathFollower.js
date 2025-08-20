// allowed characters
const ALLOWED = new Set(["@", "x", "-", "|", "+", " ", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);

// move by one "field"
const DIRS = {
  UP:    { dx: 0, dy: -1, axis: "V", name: "UP" },
  DOWN:  { dx: 0, dy:  1, axis: "V", name: "DOWN" },
  LEFT:  { dx: -1,dy:  0, axis: "H", name: "LEFT" },
  RIGHT: { dx: 1, dy:  0, axis: "H", name: "RIGHT" },
};
const OPP = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

const isLetter = (ch) => typeof ch === "string" && ch.length === 1 && ch >= "A" && ch <= "Z";
const isPathChar = (ch) => typeof ch === "string" && ch !== " " && ALLOWED.has(ch);

class Grid {
  constructor(lines) { this.lines = lines.slice(); }
  h() { return this.lines.length; }
  w(y) { return (this.lines[y] ?? "").length; }
  get(x, y) { return y < 0 || y >= this.h() || x < 0 || x >= this.w(y) ? " " : (this.lines[y][x] ?? " "); }
  set(x, y, ch) { const row = this.lines[y] || ""; this.lines[y] = row.substring(0,x) + ch + row.substring(x+1); }
  countChar(ch) { return this.lines.join("").split("").filter(c => c === ch).length; }
  findChar(ch) {
    const pos = [];
    for (let y = 0; y < this.h(); y++) {
      const row = this.lines[y] || "";
      let idx = row.indexOf(ch);
      while (idx !== -1) {
        pos.push({ x: idx, y });
        idx = row.indexOf(ch, idx + 1);
      }
    }
    return pos;
  }
  // check for invalid characters
  validateAllowed() {
    for (let y = 0; y < this.h(); y++) {
      const row = this.lines[y] || "";
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (!ALLOWED.has(ch)) throw new Error(`Invalid character '${ch}' at (${x},${y})`);
      }
    }
  }
}

function charSupportsAxis(ch, axis) {
  if (ch === "@" || ch === "x") return true;
  if (ch === "|") return axis === "V";
  if (ch === "-") return axis === "H";
  if (ch === "+") return true;
  if (isLetter(ch)) return true;
  return false;
}


// lookahead rule: allow passing through a mismatched direction characters if the next cell supports current axis
function supportsAxisWithLookahead(grid, x, y, dir) {
  const ch = grid.get(x, y);
  if (!isPathChar(ch)) return false;
  if (charSupportsAxis(ch, dir.axis)) return true;

  if (dir.axis === "V" && ch === '-') { // check when direction vertical and next position is "-"
    const nx = x + dir.dx, ny = y + dir.dy;
    const nextCh = grid.get(nx, ny);
    return isPathChar(nextCh) && charSupportsAxis(nextCh, "V");
  }
  if (dir.axis === "H" && ch === '|') {  // for horisontal direction
    const nx = x + dir.dx, ny = y + dir.dy;
    const nextCh = grid.get(nx, ny);
    return isPathChar(nextCh) && charSupportsAxis(nextCh, "H");
  }
  return false;
}

// get characters on neighbor positions
function neighbors(grid, x, y) {
  return [
    { dir: DIRS.UP,    ch: grid.get(x, y - 1), x, y: y - 1 },
    { dir: DIRS.DOWN,  ch: grid.get(x, y + 1), x, y: y + 1 },
    { dir: DIRS.LEFT,  ch: grid.get(x - 1, y), x: x - 1, y },
    { dir: DIRS.RIGHT, ch: grid.get(x + 1, y), x: x + 1, y },
  ];
}

// choose start directions
function chooseStartDirection(grid, sx, sy) {
  const opts = neighbors(grid, sx, sy).filter(n => isPathChar(n.ch) && supportsAxisWithLookahead(grid, n.x, n.y, n.dir));
  if (opts.length === 0) throw new Error("Broken path: no path from start");
  if (opts.length > 1) throw new Error("Multiple starting paths");
  return opts[0].dir;
}

// fidn start and end, and check if they are only one
function validateEndpoints(grid) {
  const starts = grid.findChar("@");
  const ends = grid.findChar("x");
  if (starts.length === 0) throw new Error("Missing start character '@'");
  if (starts.length > 1) throw new Error("Multiple starts");
  if (ends.length === 0) throw new Error("Missing end character 'x'");
  return { start: starts[0], end: ends[0] };
}

 // start walking
function walk(lines) {
  const grid = new Grid(lines);
  grid.validateAllowed();
  const { start } = validateEndpoints(grid); // check allowed chars
  let dir = chooseStartDirection(grid, start.x, start.y);

  const visited = new Set(); // take care of already visited positions
  const letters = [];
  const pathChars = [];

  let x = start.x, y = start.y;
  pathChars.push(grid.get(x, y)); // put visited position

  const maxSteps = Math.max(1000, lines.reduce((a, l) => a + (l ? l.length : 0), 0) * 5); //dont go forever
  let steps = 0;

  // start walking
  while (steps++ < maxSteps) {
    const nx = x + dir.dx, ny = y + dir.dy; // new position
    const ch = grid.get(nx, ny);
    if (!isPathChar(ch)) throw new Error("Broken path"); // if no path, throw error

    if (!supportsAxisWithLookahead(grid, nx, ny, dir)) throw new Error("Fake turn or wrong axis"); // check for wrong axis

    // add to path
    pathChars.push(ch);

    // record result
    if (ch === 'x') return { letters: letters.join(''), path: pathChars.join('') };

    // on crossroad
    if (ch === '+') {
      const fx = nx + dir.dx, fy = ny + dir.dy;
      const canStraight = supportsAxisWithLookahead(grid, fx, fy, dir); // get next position and check if can go straight

      // get possible neighbor positions
      const opts = neighbors(grid, nx, ny).filter(n => OPP[dir.name] !== n.dir.name && supportsAxisWithLookahead(grid, n.x, n.y, n.dir));
      const perp = opts.filter(n => n.dir.axis !== dir.axis);

      if (canStraight) { // can go straight but with no alternatives
        if (perp.length === 0) throw new Error("Fake '+' without perpendicular connection");
      } else { 
        if (perp.length !== 1) throw new Error("Fork in path or broken '+'"); // fork in path, or no path after +
        dir = perp[0].dir;
      }
    } else if (isLetter(ch)) {
      const key = `${nx},${ny}`;
      if (!visited.has(key)) { 
        letters.push(ch); visited.add(key); 
      } // push to letters if not visited before

      // prefer to go straight if possible
      const fx = nx + dir.dx, fy = ny + dir.dy;
      if (!supportsAxisWithLookahead(grid, fx, fy, dir)) { // must turn
        const options = neighbors(grid, nx, ny).filter(n => OPP[dir.name] !== n.dir.name && supportsAxisWithLookahead(grid, n.x, n.y, n.dir));
        const turns = options.filter(n => n.dir.axis !== dir.axis);
        if (turns.length !== 1) throw new Error("Fork in path or fake turn at letter"); // cant turn after letter
        dir = turns[0].dir;
      }   
    }

    x = nx; y = ny; // change position
  }

  throw new Error("Did not reach end 'x' (possible loop)");
}

// Export
module.exports = {
  walk,
  Grid,
  DIRS,
  OPP,
  chooseStartDirection,
  validateEndpoints
};



