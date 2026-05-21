(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.MahjongGame = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function (root) {
  "use strict";

  const Tiles =
    root.MahjongTiles ||
    (typeof require === "function" ? require("./tiles.js") : null);

  const PLAYER_SEATS = ["self", "shimocha", "kamicha"];
  const DEFAULT_PLAYER_NAMES = ["Player 1", "CPU Shimocha", "CPU Kamicha"];

  const INITIAL_HAND_SIZE = 13;
  const DEAL_TILE_COUNT = 39;
  const DRAW_WALL_COUNT = 63;
  const DORA_INDICATOR_COUNT = 1;
  const URA_DORA_INDICATOR_COUNT = 1;
  const RINSHAN_TILE_COUNT = 8;
  const TOTAL_WALL_COUNT =
    DEAL_TILE_COUNT +
    DRAW_WALL_COUNT +
    DORA_INDICATOR_COUNT +
    URA_DORA_INDICATOR_COUNT +
    RINSHAN_TILE_COUNT;

  function assertTiles() {
    if (!Tiles) {
      throw new Error("MahjongTiles is not loaded.");
    }
  }

  function cloneTile(tile) {
    return tile ? { ...tile } : null;
  }

  function cloneTiles(tiles) {
    return Array.isArray(tiles) ? tiles.map(cloneTile).filter(Boolean) : [];
  }

  function tileFromDiscard(discard) {
    return discard?.tile || discard || null;
  }

  function cloneDiscard(discard) {
    const tile = tileFromDiscard(discard);
    if (!tile) return null;
    return {
      tile: cloneTile(tile),
      isRiichiDeclaration: Boolean(discard?.isRiichiDeclaration),
      isTsumogiri: Boolean(discard?.isTsumogiri),
    };
  }

  function cloneDiscards(discards) {
    return Array.isArray(discards) ? discards.map(cloneDiscard).filter(Boolean) : [];
  }

  function tilesFromDiscards(discards) {
    return cloneTiles((discards || []).map(tileFromDiscard));
  }

  function clonePlayer(player) {
    return {
      ...player,
      hand: cloneTiles(player.hand),
      discards: cloneDiscards(player.discards),
      flowers: cloneTiles(player.flowers),
      melds: Array.isArray(player.melds) ? player.melds.map((meld) => ({ ...meld })) : [],
    };
  }

  function cloneGameState(gameState) {
    const drawWall = cloneTiles(gameState.drawWall || gameState.wall);
    return {
      ...gameState,
      dealTiles: cloneTiles(gameState.dealTiles),
      drawWall,
      wall: drawWall.map(cloneTile),
      rinshanTiles: cloneTiles(gameState.rinshanTiles),
      players: gameState.players.map(clonePlayer),
      doraIndicators: cloneTiles(gameState.doraIndicators),
      uraDoraIndicators: cloneTiles(gameState.uraDoraIndicators),
      lastAction: gameState.lastAction ? { ...gameState.lastAction } : null,
    };
  }

  function createTiles() {
    assertTiles();
    return Tiles.createTiles();
  }

  function shuffleWall(tiles, random = Math.random) {
    assertTiles();
    return Tiles.shuffleWall(tiles, random);
  }

  function createWall(random = Math.random) {
    assertTiles();
    return Tiles.createWall(random);
  }

  function drawTile(wall) {
    assertTiles();
    return Tiles.drawTile(wall);
  }

  function validateWall(wall) {
    assertTiles();
    return Tiles.validateWall(wall);
  }

  function syncDrawWallState(gameState) {
    gameState.drawWall = cloneTiles(gameState.drawWall);
    gameState.wall = gameState.drawWall.map(cloneTile);
    gameState.remainingDraws = gameState.drawWall.length;
    return gameState;
  }

  function splitWall(wall) {
    const tiles = cloneTiles(wall);
    if (tiles.length !== TOTAL_WALL_COUNT) {
      throw new Error(`Marchao sanma wall must have ${TOTAL_WALL_COUNT} tiles. Current: ${tiles.length}`);
    }

    const dealTiles = tiles.slice(0, DEAL_TILE_COUNT);
    const drawWall = tiles.slice(DEAL_TILE_COUNT, DEAL_TILE_COUNT + DRAW_WALL_COUNT);
    const doraStart = DEAL_TILE_COUNT + DRAW_WALL_COUNT;
    const doraIndicators = tiles.slice(doraStart, doraStart + DORA_INDICATOR_COUNT);
    const uraDoraStart = doraStart + DORA_INDICATOR_COUNT;
    const uraDoraIndicators = tiles.slice(uraDoraStart, uraDoraStart + URA_DORA_INDICATOR_COUNT);
    const rinshanTiles = tiles.slice(uraDoraStart + URA_DORA_INDICATOR_COUNT);

    return {
      dealTiles,
      drawWall,
      doraIndicators,
      uraDoraIndicators,
      rinshanTiles,
    };
  }

  function validateWallSections(gameState) {
    const playerTiles = Array.isArray(gameState.players)
      ? gameState.players.flatMap((player) => [
          ...cloneTiles(player.hand),
          ...tilesFromDiscards(player.discards),
          ...cloneTiles(player.flowers),
          ...(Array.isArray(player.melds)
            ? player.melds.flatMap((meld) => cloneTiles(meld.tiles))
            : []),
        ])
      : [];
    const sections = {
      dealTiles: cloneTiles(gameState.dealTiles),
      drawWall: cloneTiles(gameState.drawWall || gameState.wall),
      doraIndicators: cloneTiles(gameState.doraIndicators),
      uraDoraIndicators: cloneTiles(gameState.uraDoraIndicators),
      rinshanTiles: cloneTiles(gameState.rinshanTiles),
      playerTiles,
    };
    const combined = [
      ...sections.dealTiles,
      ...sections.drawWall,
      ...sections.doraIndicators,
      ...sections.uraDoraIndicators,
      ...sections.rinshanTiles,
      ...sections.playerTiles,
    ];
    const validation = validateWall(combined);
    const sectionErrors = [];

    if (sections.dealTiles.length > DEAL_TILE_COUNT) {
      sectionErrors.push(`dealTiles cannot exceed ${DEAL_TILE_COUNT} tiles.`);
    }
    if (sections.drawWall.length > DRAW_WALL_COUNT) {
      sectionErrors.push(`drawWall cannot exceed ${DRAW_WALL_COUNT} tiles.`);
    }
    if (sections.doraIndicators.length < DORA_INDICATOR_COUNT) {
      sectionErrors.push("doraIndicators must have at least one tile.");
    }
    if (sections.uraDoraIndicators.length < URA_DORA_INDICATOR_COUNT) {
      sectionErrors.push("uraDoraIndicators must have at least one tile.");
    }
    if (sections.rinshanTiles.length > RINSHAN_TILE_COUNT) {
      sectionErrors.push(`rinshanTiles cannot exceed ${RINSHAN_TILE_COUNT} tiles.`);
    }

    return {
      valid: validation.valid && sectionErrors.length === 0,
      errors: [...validation.errors, ...sectionErrors],
      sections: Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, value.length])),
    };
  }

  function nextPlayerIndex(index) {
    return (Number(index) + 1) % 3;
  }

  function createPlayers(options = {}) {
    const dealerIndex = Number.isInteger(options.dealerIndex) ? options.dealerIndex : 0;
    const names = options.playerNames || DEFAULT_PLAYER_NAMES;
    return PLAYER_SEATS.map((seat, index) => ({
      id: seat,
      name: names[index] || DEFAULT_PLAYER_NAMES[index],
      seat,
      points: Number(options.startingPoints) || 35000,
      chips: 0,
      hand: [],
      discards: [],
      flowers: [],
      melds: [],
      isDealer: index === dealerIndex,
      isCpu: index !== 0,
    }));
  }

  function flowerAsAir(gameState, playerIndex, flowerTile) {
    const next = cloneGameState(gameState);
    if (flowerTile) {
      next.players[playerIndex].flowers.push(cloneTile(flowerTile));
      next.lastAction = {
        type: "flower",
        playerIndex,
        tileId: flowerTile.id,
      };
    }
    return syncDrawWallState(next);
  }

  function drawRinshanReplacement(gameState, playerIndex, flowers = []) {
    let next = cloneGameState(gameState);

    while (next.rinshanTiles.length > 0) {
      const drawn = drawTile(next.rinshanTiles);
      next.rinshanTiles = drawn.wall;
      if (!drawn.tile) break;

      if (drawn.tile.isFlower) {
        next = flowerAsAir(next, playerIndex, drawn.tile);
        flowers.push(drawn.tile);
        continue;
      }

      next.players[playerIndex].hand.push(drawn.tile);
      return { state: syncDrawWallState(next), tile: drawn.tile, flowers };
    }

    return { state: endHandAsRyukyoku(syncDrawWallState(next)), tile: null, flowers };
  }

  function drawNonFlowerTileWithFlowerReplacement(gameState, playerIndex = gameState.currentPlayerIndex) {
    let next = cloneGameState(gameState);
    const flowers = [];

    if (next.phase === "ryukyoku" || next.phase === "ended") {
      return { state: next, tile: null, flowers };
    }

    while (next.drawWall.length > 0) {
      const drawn = drawTile(next.drawWall);
      next.drawWall = drawn.wall;
      syncDrawWallState(next);
      if (!drawn.tile) break;

      if (drawn.tile.isFlower) {
        next = flowerAsAir(next, playerIndex, drawn.tile);
        flowers.push(drawn.tile);
        const replacement = drawRinshanReplacement(next, playerIndex, flowers);
        next = replacement.state;
        if (replacement.tile) {
          next.lastAction = {
            type: "draw",
            playerIndex,
            tileId: replacement.tile.id,
            flowers: flowers.map((tile) => tile.id),
          };
          return { state: next, tile: replacement.tile, flowers };
        }
        return { state: next, tile: null, flowers };
      }

      next.players[playerIndex].hand.push(drawn.tile);
      next.lastAction = {
        type: "draw",
        playerIndex,
        tileId: drawn.tile.id,
        flowers: flowers.map((tile) => tile.id),
      };
      return { state: syncDrawWallState(next), tile: drawn.tile, flowers };
    }

    return { state: endHandAsRyukyoku(syncDrawWallState(next)), tile: null, flowers };
  }

  function replaceInitialFlowers(gameState, playerIndex) {
    let next = cloneGameState(gameState);

    while (next.players[playerIndex].hand.some((tile) => tile.isFlower)) {
      const player = next.players[playerIndex];
      const flowerIndex = player.hand.findIndex((tile) => tile.isFlower);
      const [flowerTile] = player.hand.splice(flowerIndex, 1);
      next = flowerAsAir(next, playerIndex, flowerTile);
      next = drawRinshanReplacement(next, playerIndex).state;
      if (next.phase === "ryukyoku") break;
    }

    return syncDrawWallState(next);
  }

  function dealInitialHands(gameState) {
    let next = {
      ...cloneGameState(gameState),
      phase: "dealing",
    };

    for (let playerIndex = 0; playerIndex < next.players.length; playerIndex += 1) {
      while (next.players[playerIndex].hand.length < INITIAL_HAND_SIZE && next.dealTiles.length > 0) {
        const drawn = drawTile(next.dealTiles);
        next.dealTiles = drawn.wall;
        if (drawn.tile) {
          next.players[playerIndex].hand.push(drawn.tile);
        }
      }
    }

    for (let playerIndex = 0; playerIndex < next.players.length; playerIndex += 1) {
      next = replaceInitialFlowers(next, playerIndex);
      if (next.phase === "ryukyoku") return next;
    }

    next.currentPlayerIndex = next.dealerIndex;
    next.phase = "draw";
    next = drawNonFlowerTileWithFlowerReplacement(next, next.dealerIndex).state;
    if (next.phase !== "ryukyoku") {
      next.phase = "discard";
    }
    return syncDrawWallState(next);
  }

  function discardTile(gameState, playerIndex, tileId) {
    const next = cloneGameState(gameState);
    const player = next.players[playerIndex];
    if (!player) {
      throw new Error("Player not found.");
    }
    if (next.phase !== "discard") {
      throw new Error("Current phase does not allow discarding.");
    }
    const tileIndex = player.hand.findIndex((tile) => tile.id === tileId);
    if (tileIndex < 0) {
      throw new Error("Discard tile is not in the player's hand.");
    }
    const [discarded] = player.hand.splice(tileIndex, 1);
    const isTsumogiri =
      next.lastAction?.type === "draw" &&
      next.lastAction.playerIndex === playerIndex &&
      next.lastAction.tileId === tileId;
    player.discards.push({
      tile: discarded,
      isRiichiDeclaration: false,
      isTsumogiri,
    });
    next.phase = "draw";
    next.lastAction = {
      type: "discard",
      playerIndex,
      tileId,
      isTsumogiri,
    };
    return syncDrawWallState(next);
  }

  function nextTurn(gameState) {
    let next = syncDrawWallState(cloneGameState(gameState));
    if (next.phase === "ryukyoku" || next.phase === "ended") {
      return next;
    }
    if (next.drawWall.length <= 0) {
      return endHandAsRyukyoku(next);
    }

    const playerIndex = nextPlayerIndex(next.currentPlayerIndex);
    next.currentPlayerIndex = playerIndex;
    next.phase = "draw";
    next = drawNonFlowerTileWithFlowerReplacement(next, playerIndex).state;
    if (next.phase !== "ryukyoku") {
      next.phase = "discard";
    }
    return syncDrawWallState(next);
  }

  function decideCpuDiscard(player, gameState, random = Math.random) {
    if (!player || player.hand.length === 0) {
      return null;
    }
    const index = Math.floor(random() * player.hand.length);
    return player.hand[index];
  }

  function endHandAsRyukyoku(gameState) {
    const next = syncDrawWallState(cloneGameState(gameState));
    next.phase = "ryukyoku";
    next.lastAction = {
      type: "ryukyoku",
      playerIndex: next.currentPlayerIndex,
    };
    return next;
  }

  function startNewHand(options = {}) {
    assertTiles();
    const dealerIndex = Number.isInteger(options.dealerIndex) ? options.dealerIndex : 0;
    const wallSections = splitWall(createWall(options.random || Math.random));

    const gameState = {
      dealTiles: wallSections.dealTiles,
      drawWall: wallSections.drawWall,
      wall: wallSections.drawWall.map(cloneTile),
      rinshanTiles: wallSections.rinshanTiles,
      players: createPlayers({ ...options, dealerIndex }),
      currentPlayerIndex: dealerIndex,
      dealerIndex,
      roundWind: options.roundWind || "east",
      handNumber: options.handNumber || 1,
      honba: Math.max(0, Math.floor(Number(options.honba) || 0)),
      kyotaku: Math.max(0, Math.floor(Number(options.kyotaku) || 0)),
      doraIndicators: wallSections.doraIndicators,
      uraDoraIndicators: wallSections.uraDoraIndicators,
      remainingDraws: wallSections.drawWall.length,
      phase: "dealing",
      lastAction: null,
    };

    return dealInitialHands(gameState);
  }

  return {
    PLAYER_SEATS,
    createTiles,
    createWall,
    shuffleWall,
    splitWall,
    validateWallSections,
    dealInitialHands,
    drawTile,
    drawNonFlowerTileWithFlowerReplacement,
    flowerAsAir,
    discardTile,
    nextTurn,
    decideCpuDiscard,
    startNewHand,
    endHandAsRyukyoku,
    validateWall,
  };
});
