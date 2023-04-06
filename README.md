# Label Required Approvals Action

This is a Github Action to require the approval of a Pull Request from a team member based on the labels applied to it.
![example](./assets/checks.png)

## Configuration

### Create `.github/team-approvers.yml`

You need to provide a yml file contains the label and the approvers for the label:

```yml
BlackAjah:
  - Alviarin
  - Liandrin
BlueAjah:
  - Moiranie
  - Siuan
```

_NOTE_: only one team member per label is required to approve.

### Action Inputs

| input               | description                                                                                 | required | default value                |
| ------------------- | ------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| repo-token          | The GITHUB_TOKEN secret or a PAT that allows PR management                                  | true     | _undefined_                  |
| status              | Specifies the 'context' for the status to be set. This will show up in the PR's checks list | false    | _Required Reviews_           |
| configureation-path | Path to the label -> approvers configuration file                                           | false    | _.github/team-approvers.yml_ |

## Usage

### Create `.github/workflows/label-approvers.yml`

Create a workflow (e.g. `github/workflows/label-approvers.yml` see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)) to utilize the action. This action only needs the `GITHUB_TOKEN` secret or another token with sufficient permissions to modify labels via the Github API. The action can be use as such:

```yml
name: label-required-approvals
on:
  pull_request_review:
  pull_request:
    types: [opened, reopened, labeled, unlabeled]
jobs:
  required-approvals:
    runs-on: ubuntu-latest
    steps:
      uses: lvegerano/label-required-approvals@v1
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```
