# CubeProximity

This project was built as a smiple way for proximity chat inside Minecraft Bedrock. Specifically for the server CubeCraft Games.
<br>

## How to use
Download the executable for the opperating system you are using. Then run it, filling out the prompts on screen. It's as simple as that!
>We support both Windows & MacOS
<br>

## Trobuleshooting
**Q**: I can't connect to the server, it gives me an error when joining.
<br>**A**: Open Windows Powershell as an Administrator and run the following code: 
```ps
CheckNetIsolation LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"
```
<br>

**Q**: When joining the website, I see a user called "undefined"
<br>**A**: Refresh the page and join the room again

<br>

**Q**: I can't hear anybody in proximity voice chat.
<br>**A**: Make sure you and the user you are talking two have both moved around. This may fix this issue and let you hear each other. Otherwise contact me and I'll try to find a fix.
<br>

## How does this work?
This app uses [`bedrock-protocol`](https://www.npmjs.com/package/bedrock-protocol) to create a proxy server to CubeCraft Games. It reads player packets that are sent from the server to find a player's position. All of the data then gets sent to our website for proximity chat later on.

<img width="500" src="https://i.imgur.com/2I7iYur.png" alt="Preview">
