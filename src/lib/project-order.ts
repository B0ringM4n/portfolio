export interface OrderedProject {
  id: string;
  data: { order: number; year: number };
}

export function assertUniqueProjectOrder<T extends OrderedProject>(projects: readonly T[]): void {
  const idsByOrder = new Map<number, string[]>();

  for (const project of projects) {
    idsByOrder.set(project.data.order, [...(idsByOrder.get(project.data.order) ?? []), project.id]);
  }

  for (const [order, ids] of idsByOrder) {
    if (ids.length > 1) {
      throw new Error(`Duplicate project order ${order}: ${ids.join(', ')}`);
    }
  }
}

export function sortProjects<T extends OrderedProject>(projects: readonly T[]): T[] {
  assertUniqueProjectOrder(projects);
  return [...projects].sort((a, b) => a.data.order - b.data.order);
}
