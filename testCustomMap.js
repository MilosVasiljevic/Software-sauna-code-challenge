const readline = require("readline");
const { walk } = require("./pathFollower");

// create interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mapLines = [];

// message
console.log("Insert map row by row. Empty row = end of entry.");

rl.on("line", (line) => {
  if (line.trim() === "") {
    rl.close(); // if empty row, close interface
    try {
      const result = walk(mapLines); // test map
      console.log("\n=== Response ==="); // letters and path taken from response
      console.log("Letters collected:", result.letters);
      console.log("Path as characters:", result.path);
    } catch (e) {
      console.error("Error:", e.message); // error message if error
    }
  } else {
    mapLines.push(line); // add new row in map
  }
});
