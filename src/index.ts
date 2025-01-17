import * as core from '@actions/core'
import * as github from '@actions/github'

const IS_PR_ALREADY_CREATED = 'is-pr-already-created'

async function run() {
  const token = core.getInput('repo-token')
  const sourceBranch = core.getInput('source-branch')
  const targetBranch = core.getInput('target-branch')

  const client = github.getOctokit(token)

  try {
    core.setOutput(IS_PR_ALREADY_CREATED, 'true');
    const { data: pulls } = await client.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'open',
    })
    const prFromSourceToTarget = pulls.find(
      ({ head, base }) => {
        console.log(`Scanning pull requests, Source:${head.ref}, Base: ${base.ref}`);
        return head.ref === sourceBranch && base.ref === targetBranch
      }
    )
    if (!prFromSourceToTarget) {
      // PR from {{ sourceBranch }} to {{ targetBranch }} already exists
      core.setOutput(IS_PR_ALREADY_CREATED, 'false');
      return
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
