import { context, getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";

export function createClient(token: string): InstanceType<typeof GitHub> {
  return getOctokit(token);
}

export function getPrNumber(): number | undefined {
  return context.payload.pull_request?.number || undefined;
}

export async function getPrLabels(
  client: InstanceType<typeof GitHub>,
  prNumber: number,
  owner: string,
  repo: string
) {
  const { data: pullRequest } = await client.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  return pullRequest.labels.map((label) => label.name);
}

export async function getApprovals(
  client: InstanceType<typeof GitHub>,
  prNumber: number,
  owner: string,
  repo: string
): Promise<(string | undefined)[]> {
  const { data: reviews } = await client.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber,
  });

  const reviewers: Set<string | undefined> = new Set();
  (reviews || []).forEach((review) => {
    if (review.state === "APPROVED") {
      reviewers.add(review.user?.login);
    } else {
      reviewers.delete(review.user?.login);
    }
  });

  return [...reviewers];
}

type ListMembersParams = RestEndpointMethodTypes["teams"]["listMembersInOrg"]["parameters"]

function extractTeamPartsAsParams(team: string): ListMembersParams {
  const teamParts = team.split("/");
  if (teamParts.length !== 2) {
    throw new Error(`'${team}' is not a valid team handler`);
  }

  const org = teamParts[0].replace("@", "");
  const team_slug = teamParts[1];

  return {
    org,
    team_slug
  };
}

export async function getTeamMembers(
  client: InstanceType<typeof GitHub>,
  team: string,
): Promise<string[]> {
  const params = extractTeamPartsAsParams(team);

  const { data: members } = await client.rest.teams.listMembersInOrg(params);
  const teamMembers = members.map((member) => member.login);

  return teamMembers;
}
