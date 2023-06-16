import {
  getInput,
  setFailed,
  notice,
  error,
} from "@actions/core";
import { context } from "@actions/github";
import { createClient, getApprovals, getPrLabels, getTeamMembers } from "./github";
import { intersection, flattenApprovers } from "./utils";
import { getLabelConfig, getRequireApprovals } from "./labels";
import {
  reportStatus,
  STATE_ERROR,
  STATE_PENDING,
  STATE_SUCCESS,
} from "./reporter";

const run = async () => {
  try {
    const token = getInput("repo-token", { required: true });
    const configPath = getInput("configuration-path", { required: true });
    const client = createClient(token);
    const prNumber = context.payload.pull_request?.number;

    if (!prNumber) {
      notice("Could not get a pull request number from context, exiting...");
      return;
    }

    const yamlConfig = await getLabelConfig(configPath);

    if (!yamlConfig) {
      error("Error reading the config yaml file");
      await reportStatus(
        client,
        STATE_ERROR,
        "Action failed reading the yml file."
      );
      return;
    }

    const prLabels = await getPrLabels(
      client,
      prNumber,
      context.repo.owner,
      context.repo.repo
    );

    const requiredReviews = await flattenApprovers(
      getRequireApprovals(yamlConfig, prLabels),
      (team: string) => getTeamMembers(client, team)
    );

    const approvals = await getApprovals(
      client,
      prNumber,
      context.repo.owner,
      context.repo.repo
    );

    const needsApprovalFrom = Object.entries(requiredReviews).reduce<string[]>(
      (accum, [key, value]) => {
        const intersect = intersection([value, approvals]);
        if (!intersect.length) {
          accum.push(key);
        }
        return accum;
      },
      []
    );

    if (needsApprovalFrom.length) {
      error(`Missing approvals from labels: ${needsApprovalFrom.join()}`);
      await reportStatus(
        client,
        STATE_PENDING,
        `Awaiting reviews for labels ${needsApprovalFrom.join()}`
      );
    } else {
      await reportStatus(
        client,
        STATE_SUCCESS,
        "All required reviews have been provided"
      );
    }
  } catch (error: any) {
    setFailed(error.message);
  }
};

run();
