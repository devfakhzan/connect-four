const { app } = require("@azure/functions");
const { Sequelize, DataTypes, UUIDV4, Op } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./src/db/db.sqlite",
});

//Game table
const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.UUIDV4,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  board: {
    type: DataTypes.JSON,
    defaultValue: [
      ["e", "e", "e", "e", "e", "e", "e"],
      ["e", "e", "e", "e", "e", "e", "e"],
      ["e", "e", "e", "e", "e", "e", "e"],
      ["e", "e", "e", "e", "e", "e", "e"],
      ["e", "e", "e", "e", "e", "e", "e"],
      ["e", "e", "e", "e", "e", "e", "e"],
    ],
  },
  turn: {
    type: DataTypes.TEXT,
    defaultValue: "y", //Wikipedia says yellow starts first
  },
  winningStreakCoordinates: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: "ongoing",
  },
  winner: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  playLog: {
    type: DataTypes.JSON,
    defaultValue: []
  },
});

app.http("games", {
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  authLevel: "anonymous",
  route: "games/{gameId:guid?}/{check:alpha?}",
  handler: async (request, context) => {
    await Game.sync();

    //For clearing database:
    // await Game.destroy({
    //     where: {
    //         id: {
    //             [Op.not] : null
    //         }
    //     }
    // })
    // return

    const { gameId, check } = request.params;
    let originalHost = request.headers.get('host');
    const protocol = request.url.includes('https') ? 'https://' : 'http://';
    const originalHostWithNoTrailingSlash = `${protocol}${originalHost}`;

    const errorResponse = (errorMessage) => {
      return {
        body: JSON.stringify({
          error: errorMessage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
    };
    const methodNotAllowedErrorMessage = "Method not allowed.";
    const gameNotFoundErrorMessage = "Game not found.";

    //Request made to "/api/games"
    if (!gameId && !check) {
      

      switch (
        request.method //Check request method
      ) {
        case "GET": {
          //Get games with pagination. E.g.: /api/games?page=2

          const page = +request.query.get("page") || 1;

          if (Number.isNaN(+page) || page <= 0) {
            return errorResponse("Invalid page number.");
          }

          const perPage = 10; //10 results max per page.

          let games = await Game.findAndCountAll({
            raw: true,
            offset: page === 1 ? 0 : (page - 1) * perPage,
            limit: perPage,
          });

          const totalPages = Math.ceil((await Game.count({
            where: {
              id: {
                [Op.not]: null
              }
            }
          }))/perPage) || 1;

          return {
            body: JSON.stringify({
              games: games.rows.map((g) => {
                return {
                  ...g,
                  board: JSON.parse(g.board),
                  winningStreakCoordinates: JSON.parse(
                    g.winningStreakCoordinates
                  ),
                  playLog: JSON.parse(g.playLog),
                  plainView: `${originalHostWithNoTrailingSlash}/api/games/${g.id}/plainview`,
                };
              }),
              currentPage: page,
              totalPages
            }),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
        case "POST": {
          //Create a game
          const newGame = (
            await Game.create()
          ).get({ plain: true });

          return {
            body: JSON.stringify(newGame),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
        default: {
          return errorResponse(methodNotAllowedErrorMessage);
        }
      }
    }

    //Request made to "/api/games/<gameId>"
    if (gameId && !check) {
      switch (request.method) {
        case "GET": {
          const game = await Game.findByPk(gameId, { raw: true });

          if (!game) {
            return {
              status: 404,
              headers: {
                "Content-Type": "application/json",
              },
            };
          }
          return {
            body: JSON.stringify({
              ...game,
              board: JSON.parse(game.board),
              winningStreakCoordinates: JSON.parse(
                game.winningStreakCoordinates
              ),
              playLog: JSON.parse(game.playLog),
              plainView: `${originalHostWithNoTrailingSlash}/api/games/${game.id}/plainview`,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
        case "POST": {
          let body;
          try {
            body = await request.json();
          } catch (e) {
            return {
              body: JSON.stringify({
                error: "Invalid column specified.",
              }),
              headers: {
                "Content-Type": "application/json",
              },
            };
          }
          const col = body?.col;
          if (Number.isNaN(col) || col < 0 || col > 6) {
            return {
              body: JSON.stringify({
                error: "Invalid column.",
              }),
              headers: {
                "Content-Type": "application/json",
              },
            };
          }

          const game = await Game.findByPk(gameId, { raw: true });

          if (!game) {
            return errorResponse(gameNotFoundErrorMessage);
          }

          switch (game.status) {
            case "ended": {
              return {
                body: JSON.stringify({
                  error: `Game has ended. ${
                    game.winner === "y" ? "Yellow" : "Red"
                  } won.`,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              };
            }
            case "tie": {
              return {
                body: JSON.stringify({
                  error: "Game has ended with a tie.",
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              };
            }
          }

          const board = JSON.parse(game.board);

          //Game logic
          const maxRow = board.length - 1;
          const maxCol = board[0].length - 1;
          const playLog = JSON.parse(game.playLog) || [];
          let winningStreakCoordinates =
            JSON.parse(game.winningStreakCoordinates) || [];
          let turn = game.turn;
          let tie = game.status === "tie" ? true : false;
          let winner = "";

          //Check streak for same color in all directions
          const checkStreak = (row, col, color, direction) => {
            const pathFormulaAndSanityCheck = (step) => {
              switch (direction) {
                //Covering all direction clockwise, starting from right
                case "right": {
                  return {
                    formula: board?.[row]?.[col + step] === color,
                    failedSanityCheck: col + step > maxCol,
                    passedStreak: [row, col + step],
                  };
                }
                case "right-down": {
                  return {
                    formula: board?.[row + step]?.[col + step] === color,
                    failedSanityCheck:
                      col + step > maxCol || row + step > maxRow,
                    passedStreak: [row + step, col + step],
                  };
                }
                case "down": {
                  return {
                    formula: board?.[row + step]?.[col] === color,
                    failedSanityCheck: row + step > maxRow,
                    passedStreak: [row + step, col],
                  };
                }
                case "left-down": {
                  return {
                    formula: board?.[row + step]?.[col - step] === color,
                    failedSanityCheck: col - step < 0,
                    passedStreak: [row + step, col - step],
                  };
                }
                case "left": {
                  return {
                    formula: board?.[row]?.[col - step] === color,
                    failedSanityCheck: col - step < 0,
                    passedStreak: [row, col - step],
                  };
                }
                case "left-up": {
                  return {
                    formula: board?.[row - step]?.[col - step] === color,
                    failedSanityCheck: col - step < 0 || row - step < 0,
                    passedStreak: [row - step, col - step],
                  };
                }
                //No case 'up' because the latest turn will never have coin above it.
                case "right-up": {
                  return {
                    formula: board?.[row - step]?.[col + step] === color,
                    failedSanityCheck: col + step > maxCol || row - step < 0,
                    streak: [row - step, col + step],
                  };
                }
              }
            };

            let streak = 1;
            let step = 1;
            let streakCoords = [];
            while (pathFormulaAndSanityCheck(step).formula) {
              //When this check passes, streak is already 2
              streak++;
              if (pathFormulaAndSanityCheck(step).failedSanityCheck) {
                return [];
              }

              streakCoords.push(pathFormulaAndSanityCheck(step).passedStreak);
              if (streak === 4) {
                streakCoords.unshift([row, col]); //Last play
                return streakCoords;
              }

              step++;
            }
            return [];
          };

          //Check if all coordinates are filled with no winner
          const checkIfTie = () => {
            return board.every((row) => row.every((col) => col !== "e"));
          };

          const putCoin = (col, color) => {
            const coordOccupied = (row, col) => board?.[row]?.[col] !== "e";

            let currentRow = maxRow;
            while (coordOccupied(currentRow, col)) {
              if (currentRow < 0) {
                break;
              }
              currentRow--;
            }

            console.log(currentRow, 123)

            if (currentRow >= 0 && currentRow <= maxRow) {
              board[currentRow][col] = color;

              if (checkIfTie()) {
                tie = true;
              }
              if (checkIfIWin(currentRow, col, color)) {
                winner = color;
              }
            } else {
              return false
            }

            const red = "r";
            const yellow = "y";
            if (turn === red) {
              color = yellow;
              turn = yellow;
            } else {
              color = red;
              turn = red;
            }

            return true;
          };

          const checkIfIWin = (row, col, color) => {
            const directions = [
              "right",
              "right-down",
              "down",
              "left-down",
              "left",
              "left-up",
              "right-up",
            ];
            for (let direction of directions) {
              winningStreakCoordinates = checkStreak(
                row,
                col,
                color,
                direction
              );
              if (winningStreakCoordinates.length === 4) {
                return true;
              }
            }
            return false;
          };

          const inWinningStreak = (row, col) => {
            return winningStreakCoordinates?.find(
              (tile) => tile[0] === row && tile[1] === col
            );
          };

          playLog.push({
            color: turn,
            col,
          });

          if (!putCoin(col, turn)) {
            return errorResponse("Invalid move.")
          }

          let status;
          if (winningStreakCoordinates.length) {
            status = "ended";
          } else if (tie) {
            status = "tie";
          } else {
            status = "ongoing";
          }

          await Game.update(
            {
              board,
              winningStreakCoordinates: winningStreakCoordinates,
              status,
              winner,
              turn,
              playLog,
            },
            {
              where: {
                id: gameId,
              },
            }
          );

          const updatedGame = await Game.findByPk(gameId, {
            raw: true,
          });

          console.log(updatedGame);
          return {
            body: JSON.stringify({
              ...updatedGame,
              board: JSON.parse(updatedGame.board),
              winningStreakCoordinates: JSON.parse(
                updatedGame.winningStreakCoordinates
              ),
              playLog: JSON.parse(updatedGame.playLog),
              plainView: `${originalHostWithNoTrailingSlash}/api/games/${game.id}/plainview`,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
      }
    }

    //Request made to "/api/games/<gameId>/winner or plainview"
    if (gameId && check) {
      if (request.method !== "GET") {
        return errorResponse(methodNotAllowedErrorMessage); //Only allow GET
      }

      const game = await Game.findByPk(gameId, {
        raw: true,
      });

      if (!game) {
        return errorResponse(gameNotFoundErrorMessage);
      }

      const board = JSON.parse(game.board);
      const winner = game.winner;
      const status = game.status;

      switch (check.toLowerCase()) {
        case "winner": {
          return {
            body: JSON.stringify({
              winner: winner
                ? winner === "y"
                  ? "Yellow"
                  : "Red"
                : `No winner${
                    status === "ongoing" ? " yet" : ". The game ended in a tie"
                  }.`,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
        case "plainview": {
          return {
            body: board.map((r) => r.join(",")).join("\n"),
          };
        }
        default: {
          return {
            body: JSON.stringify({
              error: `/${check} is not found in this API`,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
      }
    }
  },
});
