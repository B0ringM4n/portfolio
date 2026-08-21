import { getCollection, type CollectionEntry } from 'astro:content';
import { sortProjects } from '@/lib/project-order';

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return sortProjects(await getCollection('projects'));
}

export async function getRelatedProjects(
  current: CollectionEntry<'projects'>,
  limit = 3,
): Promise<CollectionEntry<'projects'>[]> {
  const currentCapabilities = new Set(current.data.capabilities);
  const related = (await getProjects())
    .filter((project) => project.id !== current.id)
    .map((project) => ({
      project,
      score: project.data.capabilities.filter((capability) => currentCapabilities.has(capability)).length,
    }))
    .sort((a, b) => b.score - a.score || a.project.data.order - b.project.data.order)
    .slice(0, Math.min(limit, 3));

  return related.map(({ project }) => project);
}
