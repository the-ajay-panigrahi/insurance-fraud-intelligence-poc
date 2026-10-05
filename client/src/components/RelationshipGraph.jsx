import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { User, FileText, Building2, CreditCard, AlertCircle } from "lucide-react";

// Custom Node for Graph Entities
const EntityNode = ({ data }) => {
  const { label, sublabel, type, isTarget, isSuspicious } = data;

  const getStyle = () => {
    switch (type) {
      case "customer":
        return {
          icon: <User className="w-4 h-4 text-indigo-600" />,
          borderColor: "border-indigo-400",
          bgColor: "bg-indigo-50/60",
          tag: "Claimant",
          tagColor: "bg-indigo-100 text-indigo-700",
        };
      case "provider":
        return {
          icon: <Building2 className="w-4 h-4 text-teal-600" />,
          borderColor: "border-teal-400",
          bgColor: "bg-teal-50/60",
          tag: "Provider",
          tagColor: "bg-teal-100 text-teal-700",
        };
      case "payment":
        return {
          icon: <CreditCard className="w-4 h-4 text-rose-600" />,
          borderColor: "border-rose-400",
          bgColor: "bg-rose-50/70",
          tag: "Payout Account",
          tagColor: "bg-rose-100 text-rose-700",
        };
      case "claim":
      default:
        return {
          icon: isTarget ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <FileText className="w-4 h-4 text-slate-600" />
          ),
          borderColor: isTarget ? "border-rose-500 shadow-md ring-2 ring-rose-400/30" : "border-slate-300",
          bgColor: isTarget ? "bg-rose-50" : "bg-white",
          tag: isTarget ? "TARGET CLAIM" : "Related Claim",
          tagColor: isTarget ? "bg-rose-600 text-white font-bold" : "bg-slate-100 text-slate-700",
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`px-3 py-2.5 rounded-xl border-2 ${style.borderColor} ${style.bgColor} shadow-sm min-w-[190px] text-xs transition-all hover:shadow-md bg-white`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          {style.icon}
          <span className="truncate max-w-[100px]">{style.tag}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${style.tagColor}`}>
          {type.toUpperCase()}
        </span>
      </div>
      <div className="font-semibold text-slate-900 text-sm truncate">{label}</div>
      {sublabel && <div className="text-[11px] text-slate-500 truncate mt-0.5">{sublabel}</div>}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  customer: EntityNode,
  claim: EntityNode,
  provider: EntityNode,
  payment: EntityNode,
};

export const RelationshipGraph = ({ nodes = [], edges = [] }) => {
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { layoutedNodes: [], layoutedEdges: [] };

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 75 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const formattedNodes = nodes.map((node) => {
      const nodePos = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: (nodePos?.x || 0) - 100,
          y: (nodePos?.y || 0) - 35,
        },
      };
    });

    const formattedEdges = edges.map((edge) => ({
      ...edge,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.animated ? "#ef4444" : "#94a3b8",
        width: 16,
        height: 16,
      },
    }));

    return { layoutedNodes: formattedNodes, layoutedEdges: formattedEdges };
  }, [nodes, edges]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed rounded-xl bg-slate-50">
        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No linked entity graph available for this claim.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background color="#94a3b8" gap={16} size={1} />
        <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-lg" />
      </ReactFlow>
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-3 shadow-sm">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          Shared entity / Alert
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
          Standard relationship
        </span>
      </div>
    </div>
  );
};

export default RelationshipGraph;
