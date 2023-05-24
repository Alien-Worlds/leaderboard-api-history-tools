# leaderboard-api-history-tools

Use `.env` based on the template available in `scripts/env_template`

History tools can be run locally, to do this, create 5 separate sessions and run one process from the list in each:

```java

// 1. creates a socket server for communication between processes
yarn broadcast

// 2. Based on the variables, it initializes the necessary data/components to create tasks for other processes
yarn boot

// 3. It reads blocks and saves them to the database for later use
yarn reader

// 4. Deserializes the saved blocks, checks whether they contain the necessary action and delta data, then transfers the data of interest to the processor's task queue
yarn filter

// 5. Deserializes the actions and deltas we are interested in and then processes their contents into the expected data
yarn processor
```

or you can also run history tools on docker (not tested)

```java

// helper
scripts/run-history-tools.sh
```