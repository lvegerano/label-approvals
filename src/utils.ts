export function intersection(arrays: any[]) {
  return (arrays || []).reduce((a, b) =>
    a.filter((c: unknown) => b.includes(c))
  );
}

const teamHandleRegex = /^@[\w-]+\/[\w-]+$/;

export async function flattenApprovers(
  approversPerLabel: Record<string, string[]>,
  teamMembersResolver: (team: string) => Promise<string[]>
): Promise<Record<string, string[]>> {
  const allApprovers: Record<string, string[]> = {}

  for (const [label, approvers] of Object.entries(approversPerLabel)) {
    const approversWithTeamsMembers: string[] = [];

    for (const approver of approvers) {
      if (!teamHandleRegex.test(approver)) {
        approversWithTeamsMembers.push(approver);
      }

      const teamMembers = await teamMembersResolver(approver);
      approversWithTeamsMembers.push(...teamMembers);
    }

    const flattened = [... new Set(approversWithTeamsMembers)]; // removing duplicates
    allApprovers[label] = flattened;
  }

  return allApprovers;
}
