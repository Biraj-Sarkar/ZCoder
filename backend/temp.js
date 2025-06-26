
    const userInput = process.argv[2]; // Get input from command line arguments
    console.log("Hello, " + userInput + "!");
    /**
 * Solution to the lexicographically minimal string transformation problem in Node.js.
 *
 * We have a string s of length n over {a, b, c} and q operations of the form (x -> y),
 * each operation can be used at most once on exactly one character (or skipped), in order,
 * so as to make the final string lexicographically minimal.
 *
 * Approach:
 *   1. Process each test case independently.
 *   2. We build five disjoint‐set‐union (DSU) structures—one for each “useful” directed pair of letters:
 *        BA (b -> a), BC (b -> c), CA (c -> a), CB (c -> b), AB (a -> b).
 *      Each DSU lets us:
 *        - quickly find the largest‐index operation of that type which is still “unused,” and
 *        - mark an operation as used (i.e. remove it) via union().
 *   3. For each position i from left to right (0 to n-1):
 *        Let l = s[i].
 *        - If l == 'a', we keep it 'a' (no change needed).
 *        - If l == 'b', we try to reach 'a' by either
 *            (1) a single-step b->a (BA), or
 *            (2) two-step b->c (BC) then c->a (CA),
 *          picking the shortest path; among equal-length paths, use the one whose “smallest
 *          used operation index” is as large as possible (so we pick the largest‐index BA, or
 *          if using BC+CA, we pick the largest‐index CA and then the largest‐index BC < that CA).
 *          If we can reach ‘a’, we remove (union) the used operation(s) from their DSUs and set s[i] = 'a';
 *          otherwise s[i] stays 'b'.
 *        - If l == 'c', we first try to reach 'a' via
 *            (1) single-step c->a (CA), or
 *            (2) two-step c->b (CB) then b->a (BA).
 *          If that fails, we try to reach 'b' via
 *            (3) single-step c->b (CB), or
 *            (4) two-step c->a (CA) then a->b (AB).
 *          Again we pick shortest path and, among ties, the one with largest “bottleneck” op index.
 *          We remove those used operations from their DSUs and set s[i] to the reached letter. If none
 *          applies, s[i] remains 'c'.
 *   4. Print the resulting string.
 *
 * Time complexity: O(n + q) per test case (amortized α(q) per DSU operation).
 *
 * Usage: node this_file.js < input.txt
 */

"use strict";
import { readFileSync } from "fs";

// Fast I/O boilerplate for Node.js
let data = readFileSync(0, "utf-8").trim().split(/\s+/);
let ptr = 0;
function readInt() {
  return parseInt(data[ptr++], 10);
}
function readToken() {
  return data[ptr++];
}

////////////////////////////////////////////////////////////////////////////////
// Disjoint‐Set‐Union (DSU) for “find the largest‐index alive op ≤ k” and removal
////////////////////////////////////////////////////////////////////////////////

class DSU {
  constructor(q, isType) {
    // parent[i] = representative of the set that i belongs to
    // We'll maintain: if an operation-index i is “alive” (i ∈ this type), parent[i] = i.
    // Otherwise parent[i] = i - 1 initially, so find(i) jumps to the nearest ≤ i that is alive.
    this.parent = new Array(q + 1);
    this.q = q;
    this.parent[0] = 0;
    for (let i = 1; i <= q; i++) {
      if (isType[i]) {
        this.parent[i] = i;
      } else {
        // If not of this pair‐type, it acts as if “removed,” so its parent = i-1
        this.parent[i] = i - 1;
      }
    }
  }
  find(x) {
    // Path-compression
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }
  remove(x) {
    // “Remove” index x by union(x, x-1): i.e. link x’s root to (x-1)’s root
    let rx = this.find(x);
    let rprev = this.find(x - 1);
    if (rx !== rprev) {
      this.parent[rx] = rprev;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Main solution logic
////////////////////////////////////////////////////////////////////////////////

let t = readInt();
let out = [];

while (t--) {
  let n = readInt(),
    q = readInt();
  let s = readToken().split("");

  // Read all q operations into arrays xops[], yops[], 1-based index
  let xops = new Array(q + 1);
  let yops = new Array(q + 1);
  for (let i = 1; i <= q; i++) {
    xops[i] = readToken();
    yops[i] = readToken();
  }

  // Precompute boolean arrays isBA, isBC, isCA, isCB, isAB so we can build DSUs
  let isBA = new Array(q + 1).fill(false);
  let isBC = new Array(q + 1).fill(false);
  let isCA = new Array(q + 1).fill(false);
  let isCB = new Array(q + 1).fill(false);
  let isAB = new Array(q + 1).fill(false);

  for (let i = 1; i <= q; i++) {
    let x = xops[i],
      y = yops[i];
    if (x === "b" && y === "a") isBA[i] = true;
    if (x === "b" && y === "c") isBC[i] = true;
    if (x === "c" && y === "a") isCA[i] = true;
    if (x === "c" && y === "b") isCB[i] = true;
    if (x === "a" && y === "b") isAB[i] = true;
  }

  // Build one DSU per relevant pair
  let dsuBA = new DSU(q, isBA);
  let dsuBC = new DSU(q, isBC);
  let dsuCA = new DSU(q, isCA);
  let dsuCB = new DSU(q, isCB);
  let dsuAB = new DSU(q, isAB);

  // Process each position from left to right
  for (let i = 0; i < n; i++) {
    let l = s[i];
    if (l === "a") {
      // Already 'a'
      continue;
    } else if (l === "b") {
      // Try to reach 'a' by
      //  (1) single-step BA
      //  (2) two-step BC -> CA
      let jBA = dsuBA.find(q); // largest index ≤ q for BA
      let bestBA = jBA > 0 ? jBA : 0;

      let bestTwoA_j = 0,
        bestTwoA_k = 0; // j = BC index, k = CA index
      let kCA = dsuCA.find(q);
      if (kCA > 0) {
        // we have some CA candidate; try find BC < kCA
        let jBC = dsuBC.find(kCA - 1);
        if (jBC > 0) {
          bestTwoA_j = jBC;
          bestTwoA_k = kCA;
        }
      }

      // Pick path to 'a': prefer single-step if exists; otherwise two-step
      if (bestBA > 0) {
        // Use BA at index bestBA
        dsuBA.remove(bestBA);
        s[i] = "a";
      } else if (bestTwoA_j > 0) {
        // Use BC at bestTwoA_j, CA at bestTwoA_k
        dsuBC.remove(bestTwoA_j);
        dsuCA.remove(bestTwoA_k);
        s[i] = "a";
      } else {
        // Can't reach 'a'; stay 'b'
      }
    } else {
      // l === 'c'
      // First try to reach 'a' by
      //  (1) single-step CA
      //  (2) two-step CB -> BA
      let jCA = dsuCA.find(q);
      let bestCA = jCA > 0 ? jCA : 0;

      let bestTwoA_j = 0,
        bestTwoA_k = 0; // j = CB index, k = BA index
      let kBA = dsuBA.find(q);
      if (kBA > 0) {
        let jCB = dsuCB.find(kBA - 1);
        if (jCB > 0) {
          bestTwoA_j = jCB;
          bestTwoA_k = kBA;
        }
      }

      if (bestCA > 0) {
        // Single-step c->a
        dsuCA.remove(bestCA);
        s[i] = "a";
      } else if (bestTwoA_j > 0) {
        // Two-step c->b (CB at bestTwoA_j) then b->a (BA at bestTwoA_k)
        dsuCB.remove(bestTwoA_j);
        dsuBA.remove(bestTwoA_k);
        s[i] = "a";
      } else {
        // Can't reach 'a', try to reach 'b' by
        //  (3) single-step CB
        //  (4) two-step CA -> AB
        let jCB_single = dsuCB.find(q);
        let bestCB_single = jCB_single > 0 ? jCB_single : 0;

        let bestTwoB_j = 0,
          bestTwoB_k = 0; // j = AB index, k = CA index
        let kCA2 = dsuCA.find(q);
        if (kCA2 > 0) {
          let jAB = dsuAB.find(kCA2 - 1);
          if (jAB > 0) {
            bestTwoB_j = jAB;
            bestTwoB_k = kCA2;
          }
        }

        if (bestCB_single > 0) {
          // Single-step c->b
          dsuCB.remove(bestCB_single);
          s[i] = "b";
        } else if (bestTwoB_j > 0) {
          // Two-step c->a (CA at bestTwoB_k), then a->b (AB at bestTwoB_j)
          dsuCA.remove(bestTwoB_k);
          dsuAB.remove(bestTwoB_j);
          s[i] = "b";
        } else {
          // Can't reach 'b'; stays 'c'
        }
      }
    }
  }

  out.push(s.join(""));
}

process.stdout.write(out.join("\n") + "\n");

  