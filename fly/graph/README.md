# Graph

The following services on fly.io are from risedle/monorepo: https://github.com/risedle/monorepo/blob/78dd4c032e91f8e9afb337db2856d8bc6edfafcf/apps/graph-node
Thanks to the risedle team for their awesome work.

## Setting up the database

Run the following commands to create the database:

```
CREATE DATABASE graph_node
WITH OWNER = postgres
ENCODING = 'UTF8'
LC_COLLATE = 'C'
LC_CTYPE = 'C'
TEMPLATE template0;
```

## Update the secrets

```
fly secrets set \
  postgres_host="lightdotso-postgres.internal" \
  postgres_port="5432" \
  postgres_user="postgres" \
  postgres_pass="" \
  postgres_db="graph_node" \
  ipfs="risedle-ipfs.internal:5001" \
  ethereum="mainnet:http://lightdotso-rpc-internal.internal:3000/1 xdai:http://lightdotso-rpc-internal.internal:3000/100 matic:http://lightdotso-rpc-internal.internal:3000/137 optimism:http://lightdotso-rpc-internal.internal:3000/10 arbitrum-one:http://lightdotso-rpc-internal.internal:3000/42161 avalanche:http://lightdotso-rpc-internal.internal:3000/43114 base:http://lightdotso-rpc-internal.internal:3000/8453 bsc:http://lightdotso-rpc-internal.internal:3000/56"
```

## Access the services

### GraphiQL

```
fly proxy 9000:9000 lightdotso-graph.internal
```

### Admin

```
fly proxy 9020:9020 lightdotso-graph.internal
```

### Indexer

```
fly proxy 9030:9030 lightdotso-graph.internal
```

### Metrics

```
fly proxy 9040:9040 lightdotso-graph.internal
```
