# Connect Four Web Application

This repository contains a web application version of the game ["Connect Four"](https://en.m.wikipedia.org/wiki/Connect_Four). The author of this repository is Fakhzan.


## Tech Stack

- Back-end:
    - Node.js (Microsoft Azure Static Web Apps + Microsoft Azure Functions)
    - SQLite for database
    - All games data fetching contains built-in pagination
    - Game data contains `winningStreakCoordinates` recording the winning streak coordinates
    - Game data contains `playLog` which allows the game to be replayed step-by-step
    - Game data contains `plainView` to help visualization of the current game board

- Front-end demo:
    - **[Demo Site for API Usage](https://connect-four.fakhzan.com)**
    - Web application (HTML, CSS, JS)
    - Vite + Vue.js 3
    - Custom HTTP Request logging to see which action triggers which API endpoint

## API

#### Create a new Connect Four game

<details>
 <summary><code>POST</code> <code><b>/api/games</b></code></summary>

##### Parameters

None

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Returns the newly created Connect Four game's game object)
<details> <summary>JSON</summary>

```json
{
    "id": "d9b71799-0193-4413-a9d8-d584221dc3e7",
    "board": [
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ]
    ],
    "turn": "y",
    "winningStreakCoordinates": [],
    "status": "ongoing",
    "winner": null,
    "playLog": [],
    "updatedAt": "2023-11-20T14:29:20.810Z",
    "createdAt": "2023-11-20T14:29:20.810Z"
}
```
</details>
</details>

------------------------------------------------------------------------------------------

#### Get all created Connect Four games

<details>
 <summary><code>GET</code> <code><b>/api/games</b></code></summary>

##### Query Parameters

|   Query     |        Type      |     Required    | Default Value| Example Value
|------------|--------------------|----------------|--------------|---------------
| `page`      | `Integer`         |    `No`        | `1`            | `2`

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Returns all the game objects on the (un)specified page)
<details> <summary>JSON</summary>

```json
{
    "games": [
        {
            "id": "5539bb05-ad22-4700-80c0-67f22f3e25eb",
            "board": [
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ],
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ],
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ],
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ],
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ],
                [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ]
            ],
            "turn": "y",
            "winningStreakCoordinates": [],
            "status": "ongoing",
            "winner": null,
            "playLog": [],
            "createdAt": "2023-11-20 15:42:06.675 +00:00",
            "updatedAt": "2023-11-20 15:42:06.675 +00:00",
            "plainView": "http://127.0.0.1:7071/api/games?page=1/api/games/5539bb05-ad22-4700-80c0-67f22f3e25eb/plainview"
        }
    ],
    "currentPage": 1,
    "totalPages": 1
}
```
</details>
</details>


------------------------------------------------------------------------------------------

#### Play on the specified `gameId` Connect Four game

<details>
 <summary><code>POST</code> <code><b>/api/games/:gameId</b></code></summary>

##### Body Parameters

|   Body     |        Type      |     Required    | Default Value| Example Value
|------------|--------------------|----------------|--------------|---------------
| `col`      | `Integer`         |    `Yes`        | `None`            | `3`

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Retuns the game object)
<details> <summary>JSON</summary>

```json
{
    "id": "a07b1bee-534d-4c44-a391-bf9a4195bee2",
    "board": [
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "y",
            "e",
            "e",
            "e",
            "e",
            "e"
        ]
    ],
    "turn": "r",
    "winningStreakCoordinates": [],
    "status": "ongoing",
    "winner": "",
    "playLog": [
        {
            "color": "y",
            "col": 1
        }
    ],
    "createdAt": "2023-11-20 15:56:35.686 +00:00",
    "updatedAt": "2023-11-20 16:37:00.576 +00:00",
    "plainView": "http://127.0.0.1:7071/api/games/a07b1bee-534d-4c44-a391-bf9a4195bee2/plainview"
}
```
</details>
</details>



------------------------------------------------------------------------------------------

#### Get a specific Connect Four game OR **Play on the specified `gameId` Connect Four game if ``col`` query parameter is supplied**

<details>
 <summary><code>GET</code> <code><b>/api/games/:gameId</b></code></summary>

##### Query Parameters

|   Query     |        Type      |     Required    | Default Value| Example Value
|------------|--------------------|----------------|--------------|---------------
| `col`      | `Integer`         |    `No`        | `None`            | `3`

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Retuns the game object)
<details> <summary>JSON</summary>

```json
{
    "id": "a07b1bee-534d-4c44-a391-bf9a4195bee2",
    "board": [
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "y",
            "e",
            "e",
            "e",
            "e",
            "e"
        ]
    ],
    "turn": "r",
    "winningStreakCoordinates": [],
    "status": "ongoing",
    "winner": "",
    "playLog": [
        {
            "color": "y",
            "col": 1
        }
    ],
    "createdAt": "2023-11-20 15:56:35.686 +00:00",
    "updatedAt": "2023-11-20 16:37:00.576 +00:00",
    "plainView": "http://127.0.0.1:7071/api/games/a07b1bee-534d-4c44-a391-bf9a4195bee2/plainview"
}
```
</details>
</details>


------------------------------------------------------------------------------------------

#### Play on the created Connect Four game

<details>
 <summary><code>POST</code> <code><b>/api/games/:gameId</b></code></summary>

##### Body Parameters

|   Body     |        Type      |     Required    | Default Value| Example Value
|------------|--------------------|----------------|--------------|---------------
| `col`      | `Integer`         |    `Yes`        | `None`            | `3`

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Retuns the game object)
<details> <summary>JSON</summary>

```json
{
    "id": "a07b1bee-534d-4c44-a391-bf9a4195bee2",
    "board": [
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "e",
            "e",
            "e",
            "e",
            "e",
            "e"
        ],
        [
            "e",
            "y",
            "e",
            "e",
            "e",
            "e",
            "e"
        ]
    ],
    "turn": "r",
    "winningStreakCoordinates": [],
    "status": "ongoing",
    "winner": "",
    "playLog": [
        {
            "color": "y",
            "col": 1
        }
    ],
    "createdAt": "2023-11-20 15:56:35.686 +00:00",
    "updatedAt": "2023-11-20 16:37:00.576 +00:00",
    "plainView": "http://127.0.0.1:7071/api/games/a07b1bee-534d-4c44-a391-bf9a4195bee2/plainview"
}
```
</details>
</details>


------------------------------------------------------------------------------------------

#### Get the winner of a specific Connect Four game

<details>
 <summary><code>GET</code> <code><b>/api/games/:gameId/winner</b></code></summary>

##### Query Parameters

None

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `application/json` | 

##### Example Response (Retuns an object with "winner" key-value pair)
<details> <summary>JSON</summary>

```json
{
    "winner": "No winner yet."
}
```
</details>
</details>


------------------------------------------------------------------------------------------

#### Get the plain text view visualization of a specific Connect Four game

<details>
 <summary><code>GET</code> <code><b>/api/games/:gameId/plainview</b></code></summary>

##### Query Parameters

None

##### Response

| HTTP Code  | Content-Type     |
|------------|------------------|
| `200`      | `text/plain` | 

##### Example Response (Retuns an object with "winner" key-value pair)
<details> <summary>Plain text</summary>

```text
e,e,e,e,e,e,e
e,e,e,e,e,e,e
e,e,y,e,e,e,e
e,e,y,r,e,e,e
e,e,y,r,e,e,e
e,e,y,r,e,e,e
```
</details>

> `Note: e = Empty (unplayed coordinate), y = Yellow coin at this coordinate r = Red coin at this coordinate.`
</details>
