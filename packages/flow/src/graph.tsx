// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import dagre from "@dagrejs/dagre";
import type { PostgresTable } from "@gregnr/postgres-meta/base";
// import { useTablesQuery } from "~/data/tables/tables-query";
import { useDebouncedValue } from "@lightdotso/hooks";
import { useQueryUserOperations } from "@lightdotso/query";
import {} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { uniqBy } from "lodash";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
  Position,
  useReactFlow,
  useStore,
} from "reactflow";
import type { Address } from "viem";
import { SchemaGraphLegend } from "./legend";
import {
  TABLE_NODE_ROW_HEIGHT,
  TABLE_NODE_WIDTH,
  TableEdge,
  TableNode,
} from "./node";

export function UserOperationMerkleGraph({
  address,
}: {
  address: Address;
}) {
  const { resolvedTheme } = useTheme();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const {
    userOperations: allUserOperations,
    userOperationsError,
    isUserOperationsLoading,
    isUserOperationsError,
  } = useQueryUserOperations({
    address: address,
    order: "asc",
    status: "executed",
    limit: 10,
    offset: 10,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: true,
  });

  const _userOperations = useMemo(
    () =>
      allUserOperations?.filter(
        (userOperation) => userOperation.status === "EXECUTED",
      ),
    [allUserOperations],
  );

  const tables: PostgresTable[] = [];

  const isUserOperationsEmpty = tables && tables.length === 0;

  const reactFlowInstance = useReactFlow<TableNodeData>();
  const nodeTypes = useMemo(
    () => ({
      table: TableNode,
    }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({
      table: TableEdge,
    }),
    [],
  );

  const fitView = useCallback(
    (duration = 500) => {
      reactFlowInstance.fitView({
        padding: 0.4,
        duration,
      });
    },
    [reactFlowInstance],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (tables) {
      getGraphDataFromTables(tables).then(({ nodes, edges }) => {
        reactFlowInstance.setNodes(nodes);
        reactFlowInstance.setEdges(edges);

        // `fitView` needs to happen during next event tick
        setTimeout(() => fitView(isFirstLoad ? 0 : 500), 0);

        if (tables.length > 0) {
          setIsFirstLoad(false);
        }
      });
    }
  }, [reactFlowInstance, tables, resolvedTheme, fitView, isFirstLoad]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md border bg-muted/50">
      <ReactFlow
        className=""
        defaultNodes={[]}
        defaultEdges={[]}
        defaultEdgeOptions={{
          type: "smoothstep",
          deletable: false,
          style: {
            stroke: "hsl(var(--muted-foreground))",
            strokeWidth: 1,
            strokeDasharray: 6,
            strokeDashoffset: -12,
            // Manually create animation so that it doesn't interfere with our custom edge component
            animation: "dashdraw 1s linear infinite",
          },
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.4}
        maxZoom={1}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        panOnScrollSpeed={1}
      >
        <ResizeHandler onResize={() => fitView()} />
        <Background
          gap={32}
          className={cn(
            "bg-muted/5 transition-colors",
            isUserOperationsLoading ||
              isUserOperationsError ||
              isUserOperationsEmpty
              ? "text-secondary-foreground"
              : "text-foreground",
          )}
          variant={BackgroundVariant.Dots}
          size={1}
          color="hsl(var(--muted-foreground)/.5)"
        />
        <div className="absolute flex h-full w-full items-center justify-center p-4 text-center font-medium">
          {isUserOperationsLoading && (
            <div className="flex items-center gap-4 text-primary/25">
              <Loader className="animate-spin" size={28} />
              <p className="text-xl">Loading schema...</p>
            </div>
          )}
          {isUserOperationsError && (
            <div className="flex gap-2 text-primary/25">
              <p>Error loading schema from the database:</p>
              <p>{`${userOperationsError?.message ?? "Unknown error"}`}</p>
            </div>
          )}
          {isUserOperationsEmpty && (
            <h2 className="w-[500px] font-light text-2xl text-primary/25">
              Ask AI to create a table
            </h2>
          )}
        </div>
        <Controls
          className="[&.react-flow\_\_controls]:shadow-none [&_button:hover]:bg-background [&_button]:rounded-md [&_button]:border-none [&_button]:bg-border [&_button]:text-blue [&_svg]:fill-current"
          showZoom={false}
          showInteractive={false}
          position="top-right"
          fitViewOptions={{
            duration: 200,
          }}
        />
      </ReactFlow>
      <SchemaGraphLegend />
    </div>
  );
}

type TableNodeData = {
  name: string;
  isForeign: boolean;
  columns: {
    id: string;
    isPrimary: boolean;
    isNullable: boolean;
    isUnique: boolean;
    isUpdateable: boolean;
    isIdentity: boolean;
    name: string;
    format: string;
  }[];
};

async function getGraphDataFromTables(tables: PostgresTable[]): Promise<{
  nodes: Node<TableNodeData>[];
  edges: Edge[];
}> {
  if (!tables.length) {
    return { nodes: [], edges: [] };
  }

  const nodes = tables.map((table) => {
    const columns = (table.columns || [])
      .sort((a, b) => a.ordinal_position - b.ordinal_position)
      .map((column) => {
        return {
          id: column.id,
          isPrimary: table.primary_keys.some((pk) => pk.name === column.name),
          name: column.name,
          format: column.format,
          isNullable: column.is_nullable,
          isUnique: column.is_unique,
          isUpdateable: column.is_updatable,
          isIdentity: column.is_identity,
        };
      });

    return {
      id: `${table.id}`,
      type: "table",
      data: {
        name: table.name,
        isForeign: false,
        columns,
      },
      position: { x: 0, y: 0 },
    };
  });

  const edges: Edge[] = [];
  const currentSchema = tables[0].schema;
  const uniqueRelationships = uniqBy(
    tables.flatMap((t) => t.relationships),
    "id",
  );

  for (const rel of uniqueRelationships) {
    // TODO: Support [external->this] relationship?
    if (rel.source_schema !== currentSchema) {
      continue;
    }

    // Create additional [this->foreign] node that we can point to on the graph.
    if (rel.target_table_schema !== currentSchema) {
      nodes.push({
        id: rel.constraint_name,
        type: "table",
        data: {
          name: `${rel.target_table_schema}.${rel.target_table_name}.${rel.target_column_name}`,
          isForeign: true,
          columns: [],
        },
        position: { x: 0, y: 0 },
      });

      const [source, sourceHandle] = findTablesHandleIds(
        tables,
        rel.source_table_name,
        rel.source_column_name,
      );

      if (source) {
        edges.push({
          id: String(rel.id),
          type: "table",
          source,
          sourceHandle,
          target: rel.constraint_name,
          targetHandle: rel.constraint_name,
        });
      }

      continue;
    }

    const [source, sourceHandle] = findTablesHandleIds(
      tables,
      rel.source_table_name,
      rel.source_column_name,
    );
    const [target, targetHandle] = findTablesHandleIds(
      tables,
      rel.target_table_name,
      rel.target_column_name,
    );

    // We do not support [external->this] flow currently.
    if (source && target) {
      edges.push({
        id: String(rel.id),
        type: "table",
        source,
        sourceHandle,
        target,
        targetHandle,
      });
    }
  }

  return layoutElements(nodes, edges);
}

function findTablesHandleIds(
  tables: PostgresTable[],
  tableName: string,
  columnName: string,
): [string?, string?] {
  for (const table of tables) {
    if (tableName !== table.name) {
      continue;
    }

    for (const column of table.columns || []) {
      if (columnName !== column.name) {
        continue;
      }

      return [String(table.id), column.id];
    }
  }

  return [];
}

/**
 * Positions nodes relative to each other on the graph using `dagre`.
 */
const layoutElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "LR",
    align: "UR",
    nodesep: 50,
    ranksep: 50,
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: TABLE_NODE_WIDTH / 2,
      height: (TABLE_NODE_ROW_HEIGHT / 2) * (node.data.columns.length + 1), // columns + header
    });
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // biome-ignore lint/complexity/noForEach: <explanation>
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };

    return node;
  });

  return { nodes, edges };
};

/**
 * Hook to detect React Flow container resizes.
 * Calls `fn` when `width` or `height` changes.
 *
 * Debounces at 200ms by default.
 */
function useOnResize(fn: () => void, debounce = 200) {
  const reactFlowInstance = useReactFlow();

  const width = useStore(({ width }) => width);
  const height = useStore(({ height }) => height);

  const debouncedWidth = useDebouncedValue(width, debounce);
  const debouncedHeight = useDebouncedValue(height, debounce);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(fn, [reactFlowInstance, debouncedWidth, debouncedHeight]);
}

type ResizeHandlerProps = {
  onResize: () => void;
  debounce?: number;
};

/**
 * Component to detect React Flow container resizes.
 * Calls `onResize` when `width` or `height` changes.
 *
 * Debounces at 200ms by default.
 *
 * It's better to use this child component instead of the
 * `useOnResize` hook directly in order to prevent a large
 * amount of re-renders on the main component.
 */
function ResizeHandler({ onResize, debounce = 200 }: ResizeHandlerProps) {
  useOnResize(onResize, debounce);

  return null;
}
