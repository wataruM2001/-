(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.MahjongTiles = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const TILE_IMAGE_BASE = "./tiles/";
  const BACK_TILE_IMAGE = `${TILE_IMAGE_BASE}blue_back.png`;

  /**
   * @typedef {Object} Tile
   * @property {string} id
   * @property {string} baseId
   * @property {"man" | "pin" | "sou" | "honor" | "flower"} suit
   * @property {number | null} number
   * @property {string} name
   * @property {"normal" | "red" | "blue"} color
   * @property {boolean} isFlower
   * @property {number} bonusHan
   * @property {string} image
   */

  function image(fileName) {
    return `${TILE_IMAGE_BASE}${fileName}`;
  }

  function tileKind(id, baseId, suit, number, color, bonusHan, label) {
    return Object.freeze({
      id,
      baseId,
      suit,
      number,
      name: label,
      color,
      isFlower: suit === "flower",
      bonusHan,
      image: image(`${id}.png`),
      label,
    });
  }

  const TILE_DEFINITIONS = Object.freeze([
    tileKind("m1", "m1", "man", 1, "normal", 0, "1萬"),
    tileKind("m9", "m9", "man", 9, "normal", 0, "9萬"),

    tileKind("p1", "p1", "pin", 1, "normal", 0, "1筒"),
    tileKind("p2", "p2", "pin", 2, "normal", 0, "2筒"),
    tileKind("p3", "p3", "pin", 3, "normal", 0, "3筒"),
    tileKind("p4", "p4", "pin", 4, "normal", 0, "4筒"),
    tileKind("p5_red", "p5", "pin", 5, "red", 1, "赤5筒"),
    tileKind("p5_blue", "p5", "pin", 5, "blue", 1, "青5筒"),
    tileKind("p6", "p6", "pin", 6, "normal", 0, "6筒"),
    tileKind("p7", "p7", "pin", 7, "normal", 0, "7筒"),
    tileKind("p8", "p8", "pin", 8, "normal", 0, "8筒"),
    tileKind("p9", "p9", "pin", 9, "normal", 0, "9筒"),

    tileKind("s1", "s1", "sou", 1, "normal", 0, "1索"),
    tileKind("s2", "s2", "sou", 2, "normal", 0, "2索"),
    tileKind("s3", "s3", "sou", 3, "normal", 0, "3索"),
    tileKind("s4", "s4", "sou", 4, "normal", 0, "4索"),
    tileKind("s5_red", "s5", "sou", 5, "red", 1, "赤5索"),
    tileKind("s5_blue", "s5", "sou", 5, "blue", 1, "青5索"),
    tileKind("s6", "s6", "sou", 6, "normal", 0, "6索"),
    tileKind("s7", "s7", "sou", 7, "normal", 0, "7索"),
    tileKind("s8", "s8", "sou", 8, "normal", 0, "8索"),
    tileKind("s9", "s9", "sou", 9, "normal", 0, "9索"),

    tileKind("east", "east", "honor", null, "normal", 0, "東"),
    tileKind("south", "south", "honor", null, "normal", 0, "南"),
    tileKind("west", "west", "honor", null, "normal", 0, "西"),
    tileKind("north", "north", "honor", null, "normal", 0, "北"),
    tileKind("white", "white", "honor", null, "normal", 0, "白"),
    tileKind("green", "green", "honor", null, "normal", 0, "發"),
    tileKind("red", "red", "honor", null, "normal", 0, "中"),

    tileKind("flower_red", "flower", "flower", null, "red", 1, "赤花"),
    tileKind("flower_blue", "flower", "flower", null, "blue", 1, "青花"),
  ]);

  const TILE_COUNTS = Object.freeze({
    m1: 4,
    m9: 4,
    p1: 4,
    p2: 4,
    p3: 4,
    p4: 4,
    p5_red: 3,
    p5_blue: 1,
    p6: 4,
    p7: 4,
    p8: 4,
    p9: 4,
    s1: 4,
    s2: 4,
    s3: 4,
    s4: 4,
    s5_red: 3,
    s5_blue: 1,
    s6: 4,
    s7: 4,
    s8: 4,
    s9: 4,
    east: 4,
    south: 4,
    west: 4,
    north: 4,
    white: 4,
    green: 4,
    red: 4,
    flower_red: 3,
    flower_blue: 1,
  });

  const TILE_DISPLAY_GROUPS = Object.freeze([
    { name: "萬子", tileIds: Object.freeze(["m1", "m9"]) },
    {
      name: "筒子",
      tileIds: Object.freeze(["p1", "p2", "p3", "p4", "p5_red", "p5_blue", "p6", "p7", "p8", "p9"]),
    },
    {
      name: "索子",
      tileIds: Object.freeze(["s1", "s2", "s3", "s4", "s5_red", "s5_blue", "s6", "s7", "s8", "s9"]),
    },
    {
      name: "字牌",
      tileIds: Object.freeze(["east", "south", "west", "north", "white", "green", "red"]),
    },
    { name: "花牌", tileIds: Object.freeze(["flower_red", "flower_blue"]) },
  ]);

  const TILE_DEFINITION_MAP = new Map(TILE_DEFINITIONS.map((definition) => [definition.id, definition]));
  const IMAGE_PATHS = Object.freeze({
    ...Object.fromEntries(TILE_DEFINITIONS.map((definition) => [definition.id, definition.image])),
    p5: image("p5.png"),
    s5: image("s5.png"),
    blue_back: BACK_TILE_IMAGE,
  });

  function tileKindId(tileOrId) {
    const id = typeof tileOrId === "string" ? tileOrId : tileOrId?.id;
    if (!id) return "";
    if (TILE_DEFINITION_MAP.has(id)) return id;
    return String(id).replace(/_\d+$/, "");
  }

  function getTileDefinition(tileOrId) {
    return TILE_DEFINITION_MAP.get(tileKindId(tileOrId)) || null;
  }

  function createPhysicalTile(definition, copyNumber) {
    return {
      id: `${definition.id}_${copyNumber}`,
      baseId: definition.baseId,
      suit: definition.suit,
      number: definition.number,
      name: definition.name,
      color: definition.color,
      isFlower: definition.isFlower,
      bonusHan: definition.bonusHan,
      image: definition.image,
    };
  }

  function createTiles() {
    return TILE_DEFINITIONS.flatMap((definition) =>
      Array.from({ length: TILE_COUNTS[definition.id] || 0 }, (_, index) =>
        createPhysicalTile(definition, index + 1)
      )
    );
  }

  function shuffleWall(tiles, random = Math.random) {
    const shuffled = tiles.map((tile) => ({ ...tile }));
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function createWall(random = Math.random) {
    return shuffleWall(createTiles(), random);
  }

  function drawTile(wall) {
    const remainingWall = Array.isArray(wall) ? wall.map((tile) => ({ ...tile })) : [];
    const tile = remainingWall.shift() || null;
    return {
      tile,
      wall: remainingWall,
    };
  }

  function countWallByKind(wall) {
    return wall.reduce((counts, tile) => {
      const kindId = tileKindId(tile);
      counts[kindId] = (counts[kindId] || 0) + 1;
      return counts;
    }, {});
  }

  function validateWall(wall) {
    const errors = [];
    const tiles = Array.isArray(wall) ? wall : [];
    const counts = countWallByKind(tiles);
    const expectedTotal = totalTileCount();

    if (!Array.isArray(wall)) {
      errors.push("牌山が配列ではありません。");
    }
    if (tiles.length !== expectedTotal) {
      errors.push(`牌山は${expectedTotal}枚である必要があります。現在は${tiles.length}枚です。`);
    }

    Object.entries(TILE_COUNTS).forEach(([kindId, expected]) => {
      const actual = counts[kindId] || 0;
      if (actual !== expected) {
        errors.push(`${kindId} は${expected}枚必要です。現在は${actual}枚です。`);
      }
    });

    Object.keys(counts).forEach((kindId) => {
      if (!Object.hasOwn(TILE_COUNTS, kindId)) {
        errors.push(`未定義の牌 ${kindId} が含まれています。`);
      }
    });

    const ids = new Set();
    tiles.forEach((tile) => {
      if (!tile || typeof tile !== "object") {
        errors.push("不正な牌データが含まれています。");
        return;
      }
      if (ids.has(tile.id)) {
        errors.push(`牌ID ${tile.id} が重複しています。`);
      }
      ids.add(tile.id);

      const definition = getTileDefinition(tile);
      if (!definition) {
        errors.push(`牌ID ${tile.id} の牌種が定義されていません。`);
        return;
      }
      if (tile.baseId !== definition.baseId) {
        errors.push(`${tile.id} のbaseIdは ${definition.baseId} である必要があります。`);
      }
      if (tile.suit !== definition.suit) {
        errors.push(`${tile.id} のsuitは ${definition.suit} である必要があります。`);
      }
      if (tile.number !== definition.number) {
        errors.push(`${tile.id} のnumberが不正です。`);
      }
      if (tile.name !== definition.name) {
        errors.push(`${tile.id} のnameは ${definition.name} である必要があります。`);
      }
      if (tile.color !== definition.color) {
        errors.push(`${tile.id} のcolorは ${definition.color} である必要があります。`);
      }
      if (tile.isFlower !== definition.isFlower) {
        errors.push(`${tile.id} のisFlowerが不正です。`);
      }
      if (tile.bonusHan !== definition.bonusHan) {
        errors.push(`${tile.id} のbonusHanは ${definition.bonusHan} である必要があります。`);
      }
      if (tile.image !== definition.image) {
        errors.push(`${tile.id} のimageは ${definition.image} である必要があります。`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      total: tiles.length,
      counts,
    };
  }

  function dealTiles(wall = createWall(), options = {}) {
    const parsedPlayerCount = Number(options.playerCount);
    const parsedHandSize = Number(options.handSize);
    const playerCount = Math.max(1, Math.floor(Number.isFinite(parsedPlayerCount) ? parsedPlayerCount : 3));
    const handSize = Math.max(0, Math.floor(Number.isFinite(parsedHandSize) ? parsedHandSize : 13));
    const dealerIndex = Number.isInteger(options.dealerIndex) ? options.dealerIndex : null;
    const includeDealerDraw = Boolean(options.includeDealerDraw);
    let remainingWall = wall.map((tile) => ({ ...tile }));
    const hands = Array.from({ length: playerCount }, () => []);

    for (let turn = 0; turn < handSize; turn += 1) {
      for (let player = 0; player < playerCount; player += 1) {
        const drawn = drawTile(remainingWall);
        remainingWall = drawn.wall;
        if (drawn.tile) hands[player].push(drawn.tile);
      }
    }

    if (includeDealerDraw && dealerIndex !== null && hands[dealerIndex]) {
      const drawn = drawTile(remainingWall);
      remainingWall = drawn.wall;
      if (drawn.tile) hands[dealerIndex].push(drawn.tile);
    }

    return {
      hands,
      wall: remainingWall,
    };
  }

  function isFlowerTile(tileOrId) {
    const definition = getTileDefinition(tileOrId);
    return Boolean(tileOrId?.isFlower || definition?.isFlower || definition?.suit === "flower");
  }

  function tileImagePath(tileOrId) {
    if (tileOrId && typeof tileOrId === "object" && tileOrId.image) {
      return tileOrId.image;
    }
    const id = typeof tileOrId === "string" ? tileOrId : tileOrId?.id;
    return IMAGE_PATHS[id] || IMAGE_PATHS[tileKindId(id)] || getTileDefinition(tileOrId)?.image || "";
  }

  function totalTileCount() {
    return Object.values(TILE_COUNTS).reduce((sum, count) => sum + count, 0);
  }

  function summarizeTileKinds() {
    return TILE_DEFINITIONS.map((definition) => ({
      ...definition,
      count: TILE_COUNTS[definition.id] || 0,
    }));
  }

  const TILES = Object.freeze(createTiles().map((tile) => Object.freeze(tile)));

  return {
    TILE_IMAGE_BASE,
    BACK_TILE_IMAGE,
    TILE_DEFINITIONS,
    TILE_COUNTS,
    TILE_DISPLAY_GROUPS,
    IMAGE_PATHS,
    TILES,
    getTileDefinition,
    tileKindId,
    createTiles,
    shuffleWall,
    createWall,
    drawTile,
    validateWall,
    createTileWall: createTiles,
    shuffleTiles: shuffleWall,
    buildShuffledWall: createWall,
    dealTiles,
    isFlowerTile,
    tileImagePath,
    totalTileCount,
    summarizeTileKinds,
  };
});
