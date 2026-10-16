import { memo, type CSSProperties } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { GROUP_COLOR, KIND_INFO } from "../graph/catalog";
import type { Kind } from "../graph/types";

export interface CardNodeData extends Record<string, unknown> {
  kind: Kind;
  name: string;
  owner: string;
}

export type CardFlowNode = Node<CardNodeData, "card">;

function CardNodeComponent({ data, selected }: NodeProps<CardFlowNode>) {
  const info = KIND_INFO[data.kind];
  const owner = data.owner.trim();
  const subtitle = owner || info.label;
  const unnamed = !data.name.trim();
  return (
    <article
      className={selected ? "fl-card is-selected" : "fl-card"}
      style={{ "--cat": GROUP_COLOR[info.group] } as CSSProperties}
      data-group={info.group}
    >
      <Handle id="in" type="target" position={Position.Left} className="fl-port" aria-label="Input" />
      <p className="fl-kicker">{info.groupLabel}</p>
      <h3 className={unnamed ? "fl-title is-placeholder" : "fl-title"} title={data.name}>
        {unnamed ? "Name" : data.name}
      </h3>
      <p className="fl-sub" title={subtitle}>
        {subtitle}
      </p>
      <Handle id="out" type="source" position={Position.Right} className="fl-port" aria-label="Output" />
    </article>
  );
}

export const CardNode = memo(CardNodeComponent);
