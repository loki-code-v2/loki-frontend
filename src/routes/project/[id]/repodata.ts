import { TreeItem } from "~/components/project-page/file-tree";

export function organizeIntoMap(
  directoryItems: TreeItem[]
): Map<string, TreeItem[]> {
  const map: Map<string, TreeItem[]> = new Map();
  for (const item of directoryItems) {
    const pathSegments = item.path.split("/");
    const parentPath = pathSegments.slice(0, -1).join("/");
    const existingChildren = map.get(parentPath) || [];
    existingChildren.push(item);
    map.set(parentPath, existingChildren);
  }

  return map;
}
