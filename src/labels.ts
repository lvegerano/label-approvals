import { info } from "@actions/core";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { load } from "js-yaml";
import path from "path";

interface YamlConfigInt {
  [key: string]: string[];
}

export async function getLabelConfig(
  configPath: string
): Promise<YamlConfigInt> {
  info(`workspace ${process.env.GITHUB_WORKSPACE}`);
  const pathToConfig = path.join(
    process.env.GITHUB_WORKSPACE as string,
    configPath
  );

  if (!existsSync(pathToConfig)) {
    throw new Error(
      `File ${configPath} could not be found in your project's workspace. You may need the actions/checkout action to clone the repository first.`
    );
  }

  const config = await readFile(
    path.join(process.env.GITHUB_WORKSPACE as string, configPath),
    "utf-8"
  );

  return load(config) as YamlConfigInt;
}

export function getRequireApprovals(
  yamlConfig: YamlConfigInt,
  labels: string[]
) {
  return labels.reduce<Record<string, string[]>>((accum, label) => {
    if (yamlConfig[label]?.length) {
      accum[label] = [...yamlConfig[label]];
    }
    return accum;
  }, {});
}
