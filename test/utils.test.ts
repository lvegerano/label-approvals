import { flattenApprovers } from "../src/utils";

interface TestCase {
  input: Record<string, string[]>
  expected: Record<string, string[]>
}

async function mockResolver(team: string): Promise<string[]> {
  if (team === '@octopus/team-a') {
    return ['octodog', 'octobeaver'];
  }
  if (team === '@octopus/team-b') {
    return ['octodog', 'octobeaver', 'octomeerkat'];
  }

  return [];
}

const testCases: Record<string, TestCase> = {
  'singe label / no teams': {
    input: {
      'label1': ['octoshark', 'octorat', 'octoturtle']
    },
    expected: {
      'label1': ['octoshark', 'octorat', 'octoturtle']
    },
  },
  'multiple labels / no teams': {
    input: {
      'label1': ['octoshark', 'octorat', 'octoturtle'],
      'label2': ['octoturtle', 'octodog', 'octobeaver']
    },
    expected: {
      'label1': ['octoshark', 'octorat', 'octoturtle'],
      'label2': ['octoturtle', 'octodog', 'octobeaver']
    },
  },
  'singe label / with a team': {
    input: {
      'label1': ['octoshark', '@octopus/team-a', 'octoturtle']
    },
    expected: {
      'label1': ['octoshark', 'octodog', 'octobeaver', 'octoturtle']
    },
  },
  'singe label / with a team / with duplicates': {
    input: {
      'label1': ['octoshark', '@octopus/team-b', 'octoturtle', 'octodog']
    },
    expected: {
      'label1': ['octoshark', 'octodog', 'octobeaver', 'octomeerkat', 'octoturtle']
    },
  },
  'multiple labels / with teams / with duplicates': {
    input: {
      'label1': ['octoshark', 'octobeaver', '@octopus/team-b', 'octoturtle', 'octodog'],
      'label2': ['octoshark', '@octopus/team-a', 'octoturtle']
    },
    expected: {
      'label1': ['octoshark', 'octobeaver', 'octodog', 'octomeerkat', 'octoturtle'],
      'label2': ['octoshark', 'octodog', 'octobeaver', 'octoturtle']
    },
  },
};

describe(`testing 'flattenApprovers' logic`, () => {
  Object.entries(testCases).map(([testName, testCase]) => test(testName, async () => {
    const actual = await flattenApprovers(testCase.input, mockResolver);
    expect(actual).toEqual(testCase.expected);
  }));
});
