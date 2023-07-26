#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";

const lightBlue = chalk.hex("#39A4F6");
const boldLB = chalk.hex("#39A4F6").bold;
const cubeYellow = chalk.hex("#ffb624");
const validVersions = [
  "1.17.0",
  "1.17.10",
  "1.17.30",
  "1.17.40",
  "1.18.0",
  "1.18.11",
  "1.18.30",
  "1.19.1",
  "1.19.10",
  "1.19.20",
  "1.19.21",
  "1.19.30",
  "1.19.40",
  "1.19.41",
  "1.19.50",
  "1.19.60",
  "1.19.62",
  "1.19.63",
  "1.19.70",
  "1.19.80",
  "1.20.0",
  "1.20.10",
];
let playerName;
let serverName;
let MCversion;
let joined = false;

import { Relay } from "bedrock-protocol";

import WebSocket from "ws";
import { createSpinner } from "nanospinner";

// const ws = new WebSocket("ws://localhost:8082");
const ws = new WebSocket("wss://ws-jsju.onrender.com:443");

async function runCLI() {
  async function startServer() {
    const spinner = createSpinner(`${boldLB("STARTING PROXY\n\n")}`).start();
    await sleep();

    const relay = new Relay({
      // version: version, // The version
      version: MCversion,
      /* host and port to listen for clients on */
      host: "0.0.0.0",
      port: 19132,
      motd: {
        motd: "CubeProximity",
        levelName: "Proximity chat for CubeCraft!",
      },
      /* Where to send upstream packets to */
      destination: {
        host: "mco.cubecraft.net",
        port: 19132,
      },
    });

    relay.on("connect", (player) => {
      if (!joined) {
        console.log(
          `\nNew connection ${player.connection.address}${chalk.green(
            "\nDetected user joined!\n"
          )}\n ${lightBlue(
            "Navigate to this website below to enter voice chat!"
          )}\n ${chalk.underline(
            "https://admirable-crisp-7e1bf4.netlify.app/"
          )}\n\n${chalk.bgRed.italic.bold(
            "KEEP THIS WINDOW OPEN AT ALL TIMES DURING VOICE CHAT"
          )}`
        );
      } else {
        console.log("\nNew connection", player.connection.address);
      }

      joined = true;

      // // Server is sending a message to the client.
      player.on("clientbound", ({ name, params }) => {
        if (name === "set_score") {
          if (params.entries && params.entries.length > 0) {
            if (!(params.entries[0].custom_name === undefined)) {
              if (params.entries[0].custom_name.includes("User:")) {
                function removeMinecraftFormatting(text) {
                  // Regular expression to match Minecraft formatting codes
                  const regex = /§[0-9A-FK-ORa-fk-or]/g;

                  // Replace all occurrences of the formatting codes with an empty string
                  const cleanText = text.replace(regex, "");

                  return cleanText;
                }
                const cleanText = removeMinecraftFormatting(
                  params.entries[0].custom_name
                );
                playerName = cleanText.replace(/^User:\s*/, "");
              }

              if (params.entries[0].custom_name.includes("§r§8")) {
                const regexPattern = /\((.*?)\)/;
                const matchResult =
                  params.entries[0].custom_name.match(regexPattern);
                serverName = matchResult ? matchResult[1] : null;
              }
            }
          }
        }
        if (name === "text") {
          const { message } = params;

          if (message === "§9§9Let the games begin!§r") {
            GameStarted = true;
          }
        }
      });

      // Client is sending a message to the server
      player.on("serverbound", ({ name, params }) => {
        if (GameStarted) {
          if (name === "player_auth_input") {
            const { position, yaw, pitch } = params;
            const { x, y, z } = position;
            const roundedX = Math.round(x * 10) / 10;
            const roundedY = Math.round(y * 10) / 10;
            const roundedZ = Math.round(z * 10) / 10;
            const roundedYaw = Math.round(yaw * 10) / 10;

            const roundedPosition = { x: roundedX, y: roundedY, z: roundedZ };

            if (
              previousPosition === null ||
              previousPosition.x !== roundedX ||
              previousPosition.y !== roundedY ||
              previousPosition.z !== roundedZ ||
              previousYaw !== roundedYaw
            ) {
              if (
                typeof playerName === "string" &&
                typeof serverName === "string"
              ) {
                ws.send(
                  JSON.stringify({
                    x: roundedX,
                    y: roundedY,
                    z: roundedZ,
                    yaw: roundedYaw,
                    user: playerName,
                    server: serverName,
                  })
                );
              }
              previousPosition = roundedPosition;
              previousYaw = roundedYaw;
            }
          }
        }
      });
    });
    relay.listen();
    spinner.success({
      text: `${chalk.green.bold("Sucess! ")} ${lightBlue(
        "Join the server below and come back to follow the rest of the steps!\n\n"
      )}${chalk.bold("  Server IP: ")} 127.0.0.1\n  ${chalk.bold(
        "Port: "
      )}19132`,
    });
  }

  let GameStarted = true;
  let previousPosition = null;
  let previousYaw = null;

  const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
  const sleep2 = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

  async function welcome() {
    console.log(boldLB("Welcome to CubeProximity!"));

    await sleep();

    console.log(
      `${cubeYellow(
        "Before we get started, let's setup up your configuration!\n"
      )}`
    );
    await sleep2();
  }

  async function askVersion() {
    const answers = await inquirer.prompt({
      name: "version",
      type: "input",
      message: `\n\n\n${cubeYellow(
        "Enter your version of Minecraft Bedrock below!"
      )}\n\n${boldLB(
        "Versions included:"
      )} 1.17.0, 1.17.10, 1.17.30, 1.17.40, 1.18.0, 1.18.11, \n1.18.30, 1.19.1, 1.19.0, 1.19.21, 1.19.30, 1.19.40, \n1.19.41, 1.19.50, 1.19.60, 1.19.62, 1.19.63, 1.19.70, \n1.19.80, 1.20.0, & 1.20.10\n\n`,
      default() {
        return "1.20.10";
      },
    });

    MCversion = answers.version;
    if (validVersions.includes(MCversion)) {
      checkPrompt();
    } else {
      console.log(
        `\n${chalk.redBright("Not a valid version. \nPlease try again\n")}`
      );
      await sleep2();
      askVersion();
    }
  }

  async function checkPrompt() {
    const answers = await inquirer.prompt({
      name: "checkPrompt",
      type: "input",
      message: `\n\n\n\nIs this correct?\n  ${cubeYellow(
        "MC Version:"
      )} ${MCversion}\n\n  ${chalk.green("(Y")}/${chalk.red("N)")}`,
      default() {
        return "Y";
      },
    });

    if ((answers.checkPrompt === "N") | (answers.checkPrompt === "n")) {
      await askVersion();
    } else {
      console.log("\n\n");
      startServer();
    }
  }

  await welcome();
  await askVersion();
}

runCLI();
