import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Code } from "mdast";

export const remarkMermaid: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, "code", (node: Code, index, parent) => {
            if (node.lang === "mermaid" && parent && index !== undefined) {
                const mermaidHtml = {
                    type: "html" as const,
                    value: `<div class="mermaid-diagram" data-mermaid="${encodeURIComponent(node.value)}"></div>`,
                };

                parent.children.splice(index, 1, mermaidHtml);
            }
        });
    };
};