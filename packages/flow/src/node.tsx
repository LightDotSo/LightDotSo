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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { AnimatePresence, m } from "framer-motion";
import {
  CircleSlash,
  DiamondIcon,
  Fingerprint,
  Hash,
  Key,
  Network,
  Pencil,
  Table2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  type EdgeProps,
  Handle,
  type NodeProps,
  Position,
  getSmoothStepPath,
  useOnViewportChange,
  useUpdateNodeInternals,
} from "reactflow";

// ReactFlow is scaling everything by the factor of 2
export const TABLE_NODE_WIDTH = 640;
export const TABLE_NODE_ROW_HEIGHT = 80;

export type TableNodeData = {
  name: string;
  isForeign: boolean;
  columns: {
    id: string;
    isPrimary: boolean;
    isNullable: boolean;
    isUnique: boolean;
    isIdentity: boolean;
    name: string;
    format: string;
  }[];
};

const inOutTop = {
  hidden: {
    opacity: 0,
    y: -40,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

// Important styles is a nasty hack to use Handles (required for edges calculations), but do not show them in the UI.
// ref: https://github.com/wbkd/react-flow/discussions/2698
const hiddenNodeConnector =
  "!h-px !w-px !min-w-0 !min-h-0 !cursor-grab !border-0 !opacity-0";

const itemHeight = "h-[44px]";

/**
 * Custom node to display database tables.
 */
export function TableNode({
  id,
  data,
  targetPosition,
  sourcePosition,
}: NodeProps<TableNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [showHandles, setShowHandles] = useState(false);

  if (data.isForeign) {
    return (
      <header className="flex items-center gap-2 rounded-[8px] border-[1px] bg-foreground px-4 py-2 text-[1.1rem] text-background">
        {data.name}
        {targetPosition && (
          <Handle
            type="target"
            id={data.name}
            position={targetPosition}
            className={cn(hiddenNodeConnector)}
            onKeyDown={(e) => {
              e.preventDefault();
            }}
          />
        )}
      </header>
    );
  }

  return (
    <m.div
      className="overflow-hidden rounded-[8px] border shadow-md"
      style={{ width: TABLE_NODE_WIDTH / 2 }}
      variants={{
        hidden: {
          scale: 0,
        },
        show: {
          scale: 1,
        },
      }}
      initial="hidden"
      animate="show"
      onAnimationComplete={() => {
        setShowHandles(true);
        updateNodeInternals(id);
      }}
    >
      <header
        className={cn(
          "flex items-center gap-2 bg-foreground px-3 text-[1.1rem] text-background dark:bg-muted dark:text-foreground",
          itemHeight,
        )}
      >
        <Table2 strokeWidth={1.3} size={21} className="text-muted-foreground" />
        {/* Animate the old title out and new title in */}
        <AnimatePresence mode="popLayout">
          <m.span
            key={data.name}
            className="font-medium"
            variants={inOutTop}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {data.name}
          </m.span>
        </AnimatePresence>
      </header>
      {data.columns.map((column) => (
        <TableColumn
          key={column.id}
          column={column}
          data={data}
          showHandles={showHandles}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
        />
      ))}
    </m.div>
  );
}

type TableColumnProps = {
  column: TableNodeData["columns"][number];
  data: TableNodeData;
  showHandles: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
function TableColumn({
  column,
  // data,
  showHandles,
  sourcePosition,
  targetPosition,
}: TableColumnProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  useOnViewportChange({
    onChange() {
      setIsPopoverOpen(false);
    },
  });

  return (
    <DropdownMenu
      key={`${column.id}-${column.name}-dropdown-menu`}
      modal={false}
      open={isPopoverOpen}
      onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (!open) {
          setIsRenaming(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <m.div
          className={cn(
            "relative flex flex-row justify-items-start text-[16px] leading-10",
            "bg-card hover:bg-accent data-[state=open]:bg-accent",
            "border-t ",
            "border-t-[1px]",
            "overflow-hidden",
            itemHeight,
          )}
          variants={{
            hidden: {
              opacity: 0,
            },
            show: {
              opacity: 1,
            },
          }}
          initial="hidden"
          animate="show"
          exit="hidden"
          transition={{ staggerChildren: 0.05 }}
        >
          <div
            className={cn(
              "mx-4 flex items-center justify-start gap-[0.48rem] align-middle",
              column.isPrimary && "basis-1/5",
            )}
          >
            {/* Animate the icon in and out */}
            <AnimatePresence mode="popLayout">
              {column.isPrimary && (
                <m.div
                  key={String(column.isPrimary)}
                  variants={inOutTop}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <Key
                    size={16}
                    strokeWidth={2}
                    className={cn("flex-shrink-0", "text-muted-foreground")}
                  />
                </m.div>
              )}
            </AnimatePresence>
            {/* Animate the old icon out and new icon in */}
            <AnimatePresence mode="popLayout">
              {column.isNullable ? (
                <m.div
                  key={String(column.isNullable)}
                  variants={inOutTop}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <DiamondIcon
                    size={16}
                    strokeWidth={2}
                    className="flex-shrink-0 text-muted-foreground"
                  />
                </m.div>
              ) : (
                <m.div
                  key={String(column.isNullable)}
                  variants={inOutTop}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <DiamondIcon
                    size={16}
                    strokeWidth={2}
                    fill="currentColor"
                    className="flex-shrink-0 text-muted-foreground"
                  />
                </m.div>
              )}
            </AnimatePresence>
            {/* Animate the icon in and out */}
            <AnimatePresence mode="popLayout">
              {column.isUnique && (
                <m.div
                  key={String(column.isUnique)}
                  variants={inOutTop}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <Fingerprint
                    size={16}
                    strokeWidth={2}
                    className="flex-shrink-0 text-muted-foreground"
                  />
                </m.div>
              )}
            </AnimatePresence>
            {/* Animate the icon in and out */}
            <AnimatePresence mode="popLayout">
              {column.isIdentity && (
                <m.div
                  key={String(column.isIdentity)}
                  variants={inOutTop}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <Hash
                    size={16}
                    strokeWidth={2}
                    className="flex-shrink-0 text-muted-foreground"
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex w-full justify-between">
            {/* Animate the old name out and new name in */}
            <AnimatePresence mode="popLayout">
              <m.span
                key={column.name}
                className="max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap"
                variants={inOutTop}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {column.name}
              </m.span>
            </AnimatePresence>
            {/* Animate the old type out and new type in */}
            <AnimatePresence mode="popLayout">
              <m.span
                key={column.format}
                className="inline-flex justify-end px-4 font-mono text-[0.8rem] text-muted-foreground"
                variants={inOutTop}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {column.format}
              </m.span>
            </AnimatePresence>
          </div>
          {showHandles && targetPosition && (
            <Handle
              type="target"
              id={column.id}
              position={targetPosition}
              className={cn(hiddenNodeConnector, "!left-0")}
            />
          )}
          {showHandles && sourcePosition && (
            <Handle
              type="source"
              id={column.id}
              position={sourcePosition}
              className={cn(hiddenNodeConnector, "!right-0")}
            />
          )}
        </m.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        onEscapeKeyDown={(e) => {
          if (isRenaming) {
            e.preventDefault();
          }
        }}
      >
        {isRenaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();

              // if (e.target instanceof HTMLFormElement) {
              // const formData = new FormData(e.target);
              // const newName = formData.get("name");
              // appendMessage({
              //   role: "user",
              //   content: `Rename the "${column.name}" column in the ${data.name} table to "${newName}"`,
              // });
              // }
              setIsPopoverOpen(false);
              setIsRenaming(false);
            }}
          >
            <input
              name="name"
              className="flex-grow bg-inherit p-2 text-base outline-none placeholder:text-neutral-400"
              placeholder={`Rename ${column.name}`}
              // when esc is pressed, setIsRenaming(false) is called
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsRenaming(false);
                }
              }}
              autoComplete="off"
              // biome-ignore lint/a11y/noAutofocus: <explanation>
              autoFocus
              // disabled={!user}
            />
          </form>
        ) : (
          <>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
              }}
              className="gap-3"
              // disabled={!user}
              onClick={() => setIsRenaming(true)}
            >
              <Pencil
                size={16}
                strokeWidth={2}
                className="flex-shrink-0 text-light"
              />
              <span>Rename column</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3"
              // disabled={!user}
              // onClick={() =>
              //   appendMessage({
              //     role: "user",
              //     content: `Make the "${column.name}" column in the ${data.name} table ${column.isNullable ? "not nullable" : "nullable"}`,
              //   })
              // }
            >
              <DiamondIcon
                size={16}
                strokeWidth={2}
                fill={column.isNullable ? "currentColor" : "none"}
                className="flex-shrink-0 text-light"
              />
              <span>
                Make {column.isNullable ? "not nullable" : "nullable"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3"
              // disabled={!user}
              // onClick={() =>
              //   appendMessage({
              //     role: "user",
              //     content: `Make the "${column.name}" column in the ${data.name} table ${column.isUnique ? "not unique" : "unique"}`,
              //   })
              // }
            >
              {column.isUnique ? (
                <CircleSlash
                  size={16}
                  strokeWidth={2}
                  className="flex-shrink-0 text-light"
                />
              ) : (
                <Fingerprint
                  size={16}
                  strokeWidth={2}
                  className="flex-shrink-0 text-light"
                />
              )}
              <span>Make {column.isUnique ? "not unique" : "unique"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3"
              // disabled={!user}
              // onClick={() =>
              //   appendMessage({
              //     role: "user",
              //     content: `Help me choose the best index for the "${column.name}" column in the ${data.name} table`,
              //   })
              // }
            >
              <Network
                size={16}
                strokeWidth={2}
                className="flex-shrink-0 text-light"
              />
              <span>Create index</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-start gap-3 bg-inherit text-destructive-600 hover:bg-neutral-200"
              // disabled={!user}
              // onClick={() =>
              //   appendMessage({
              //     role: "user",
              //     content: `Remove the "${column.name}" column in the ${data.name} table`,
              //   })
              // }
            >
              <Trash2 size={16} strokeWidth={2} className="flex-shrink-0" />
              <span>Remove column</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Custom edge that animates its path length.
 */
export function TableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  markerEnd,
  markerStart,
  pathOptions,
}: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: pathOptions?.borderRadius,
    offset: pathOptions?.offset,
  });

  return (
    <>
      <defs>
        {/* Create a mask with the same shape that animates its path length */}
        <mask id={`mask-${id}`}>
          <m.path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth={10}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25 }}
          />
        </mask>
      </defs>
      <path
        id={id}
        d={path}
        style={style}
        className={cn(["react-flow__edge-path"])}
        fill="none"
        mask={`url(#mask-${id})`}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
    </>
  );
}
